<?php

namespace tailgate\Factory;

use tailgate\Resource\Lot as Resource;
use tailgate\Resource\Spot;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lot extends Base
{
    protected $table = 'tg_lot';

    public function postNew()
    {
        $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING);
        $spots = filter_input(INPUT_POST, 'default_spots', FILTER_SANITIZE_NUMBER_INT);

        $lot = new Resource;
        $lot->setTitle($title);
        self::saveResource($lot);

        if ($spots) {
            $this->createNewSpots($spots, $lot);
        }
    }

    /**
     * Creates a number of lots based on the number of $spots
     * @param integer $spots
     * @param tailgate\Resource\Lot $lot
     */
    private function createNewSpots($spots, $lot)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_spot');

        for ($i = 1; $i <= $spots; $i++) {
            $slot = new Spot;
            $slot->setLotId($lot->getId());
            $slot->setNumber((string) $i);

            self::saveResource($slot);
        }
    }

    public function getList($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = $this->getListDB($mode, 'title');
        $lot = $db->getTable('tg_lot');
        $spot = $db->addTable('tg_spot');

        $id = $spot->addField('id');
        $id->showCount();
        $id->setAlias('total_spots');
        
        $db->setGroupBy($lot->getField('title'));

        $conditional = new \Database\Conditional($db, $lot->getField('id'), $spot->getField('lot_id'), '=');

        $db->joinResources($lot, $spot, $conditional);

        $result = $db->select();
        return $result;
    }

}
