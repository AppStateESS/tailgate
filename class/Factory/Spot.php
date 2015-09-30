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
        $spotTable = $db->getTable('tg_spot');
        $spotTable->addFieldConditional('lot_id', $lot_id);

        $gameFactory = new \tailgate\Factory\Game;
        $current_game = $gameFactory->getCurrent();
        if ($current_game && $current_game->getLotteryRun()) {
            $lotteryTable = $db->addTable('tg_lottery');
            $lotteryTable->addField('picked_up');
            $lotteryTable->addField('student_id');
            $lotteryTable->addField('spot_id');
            $lotteryTable->addField('id', 'lottery_id');
            $c1 = new \Database\Conditional($db, $lotteryTable->getField('game_id'), $current_game->getId(), '=');
            $c2 = new \Database\Conditional($db, $lotteryTable->getField('game_id'), null, 'is');
            $c3 = new \Database\Conditional($db, $c1, $c2, 'or');

            $db->addConditional($c3);

            $studentTable = $db->addTable('tg_student');
            $studentTable->addField('first_name');
            $studentTable->addField('last_name');

            $joinCond1 = $db->createConditional($spotTable->getField('id'), $lotteryTable->getField('spot_id'), '=');
            $joinCond2 = $db->createConditional($lotteryTable->getField('student_id'), $studentTable->getField('id'), '=');
            $db->joinResources($spotTable, $lotteryTable, $joinCond1, 'left');
            $db->joinResources($lotteryTable, $studentTable, $joinCond2, 'left');
        }
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
    
    public function sober($spot_id, $sober)
    {
        $spot = new Resource;
        $this->loadByID($spot, $spot_id);
        $spot->setSober($sober);
        $spot->save();
    }

}
