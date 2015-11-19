<?php

namespace tailgate\Factory;

require_once PHPWS_SOURCE_DIR . 'mod/tailgate/class/WKPDF.php';

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Report
{

    public static function pickup($game_id)
    {
        $game = Game::getById($game_id);

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
        $template = new \Template(array('rows' => $result));
        self::fillTitle($template, $game_id);
        $template->setModuleTemplate('tailgate', 'Admin/Report/pickup.html');
        $content = $template->get();
        self::downloadPDF($content, 'Pickups.pdf');
    }

    public static function winners($game_id)
    {
        $db = \Database::getDB();
        $lottery = $db->addTable('tg_lottery');
        $lottery->addFieldConditional('game_id', $game_id);
        $lottery->addFieldConditional('winner', 1);

        $student = $db->addTable('tg_student');
        $student->addField('first_name');
        $student->addField('last_name');
        $student->addField('wins');
        $student->addOrderBy('last_name');
        $c3 = $db->createConditional($lottery->getField('student_id'), $student->getField('id'), '=');
        $db->joinResources($lottery, $student, $c3, 'left');

        $users = $db->addTable('users');
        $users->addField('username');
        $c4 = $db->createConditional($student->getField('user_id'), $users->getField('id'), '=');
        $db->joinResources($student, $users, $c4);

        $spot = $db->addTable('tg_spot');
        $spot->addField('number', 'spot_number');
        $c5 = $db->createConditional($lottery->getField('spot_id'), $spot->getField('id'), '=');
        $db->joinResources($lottery, $spot, $c5, 'left');

        $lot = $db->addTable('tg_lot');
        $lot->addField('title', 'lot_title');
        $c6 = $db->createConditional($spot->getField('lot_id'), $lot->getField('id'), '=');
        $db->joinResources($spot, $lot, $c6, 'left');


        $result = $db->select();

        $template = new \Template(array('rows' => $result));
        self::fillTitle($template, $game_id);
        $template->setModuleTemplate('tailgate', 'Admin/Report/winners.html');
        $content = $template->get();
        self::downloadPDF($content, 'Winners.pdf');
    }

    public static function spotReport($game_id)
    {
        $db = \Database::getDB();
        $lot = $db->addTable('tg_lot');
        $lot->addField('title', 'lot_title');
        $lot->addOrderBy('title');
        $spot = $db->addTable('tg_spot');
        $spot->addField('number', 'spot_number');
        $spot->addOrderBy('number');

        $c1 = $db->createConditional($spot->getField('lot_id'), $lot->getField('id'), '=');
        $db->joinResources($spot, $lot, $c1);

        $lottery = $db->addTable('tg_lottery');
        $lottery->addField('id', 'lottery_id');
        $c2a = $db->createConditional($spot->getField('id'), $lottery->getField('spot_id'), '=');
        $c2b = $db->createConditional($lottery->getField('game_id'), $game_id);
        $c2 = $db->createConditional($c2a, $c2b, 'and');
        $db->joinResources($spot, $lottery, $c2, 'left');

        $student = $db->addTable('tg_student');
        $student->addField('first_name');
        $student->addField('last_name');
        $c3a = $db->createConditional($lottery->getField('student_id'), $student->getField('id'), '=');
        $c3b = $db->createConditional($lottery->getField('picked_up'), 1);
        $c3 = $db->createConditional($c3a, $c3b, 'and');
        $db->joinResources($lottery, $student, $c3, 'left');
        $result = $db->select();
        $template = new \Template(array('rows' => $result));
        self::fillTitle($template, $game_id);
        $template->setModuleTemplate('tailgate', 'Admin/Report/spots.html');

        $content = $template->get();
        
        self::downloadPDF($content, 'Spot_Report.pdf');
    }

    private static function downloadPDF($content, $filename)
    {
        if (!is_executable(WKPDF_PATH)) {
            throw new \Exception('WKPDF is not installed or executable', 666);
        }
        $pdf = new \WKPDF(WKPDF_PATH);
        if (USE_XVFB) {
            $pdf->setXVFB(XVFB_PATH);
        }
        $pdf->set_html($content);
        $pdf->render();
        $pdf->output(\WKPDF::$PDF_DOWNLOAD, '/tmp/' . $filename);
        exit();
    }
    
    private static function fillTitle($template, $game_id)
    {
        $game = Game::getById($game_id);
        $template->add('university', $game->getUniversity());
        $template->add('mascot', $game->getMascot());
        $template->add('kickoff', strftime(TAILGATE_DATE_FORMAT, $game->getKickoff()));
    }

}
