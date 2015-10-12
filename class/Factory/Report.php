<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Report
{
    public static function pickup($game_id)
    {
        $db = \Database::getDB();
        $lottery = $db->addTable('tg_lottery');
        $lottery->addField('picked_up');
        $lottery->addOrderBy('lot_id');
        $lottery->addOrderBy('spot_id');
        
        $lottery->addFieldConditional('game_id', $game_id);
        $lottery->addFieldConditional('winner', 1);
        
        $spot = $db->addTable('tg_spot');
        $spot->addField('number');
        $spot->addField('reserved');
        //$spot->addFieldConditional('active', 1);
        $c1 = $db->createConditional($lottery->getField('spot_id'), $spot->getField('id'), '=');
        $db->joinResources($lottery, $spot, $c1, 'left');
        
        $lot = $db->addTable('tg_lot');
        $lot->addField('title');
        $c2 = $db->createConditional($spot->getField('lot_id'), $lot->getField('id'), '=');
        $db->joinResources($spot, $lot, $c2, 'left');
        
        $student = $db->addTable('tg_student');
        $student->addField('first_name');
        $student->addField('last_name');
        $c3 = $db->createConditional($lottery->getField('student_id'), $student->getField('id'), '=');
        $db->joinResources($lottery, $student, $c3, 'left');
        
        $users = $db->addTable('users');
        $users->addField('username');
        $c4 = $db->createConditional($student->getField('user_id'), $users->getField('id'), '=');
        $db->joinResources($student, $users, $c4);
        
        $result = $db->select();
        
        if (empty($result)) {
            return 'Error: unable to pull lottery results.';
        }
        $template = new \Template(array('rows'=>$result));
        $template->setModuleTemplate('tailgate', 'Admin/Report/pickup.html');
        echo $template->get();
        exit;
    }
}