<?php

namespace tailgate\Factory;

use tailgate\Resource\Spot as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Spot extends Base
{
    protected $table = 'tg_spot';

    public function getList($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = $this->getListDB($mode, 'number');
        $lot_id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
        $db->getTable('tg_spot')->addFieldConditional('lot_id', $lot_id);
        $result = $db->select();
        return $result;
    }
        
    public function reserve($spot_id, $reserve)
    {
        $spot = new Resource;
        $this->loadByID($spot, $spot_id);
        $spot->setReserved($reserve);
        $spot->save();
    }
}
