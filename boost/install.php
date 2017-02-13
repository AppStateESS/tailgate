<?php

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
function tailgate_install(&$content)
{
    $db = \phpws2\Database::newDB();
    $db->begin();

    try {
        $game = new \tailgate\Resource\Game;
        $t1 = $game->createTable($db);

        $lot = new \tailgate\Resource\Lot;
        $t2 = $lot->createTable($db);

        $lottery = new \tailgate\Resource\Lottery;
        $t3 = $lottery->createTable($db);

        $spot = new \tailgate\Resource\Spot;
        $t4 = $spot->createTable($db);

        $student = new \tailgate\Resource\Student;
        $t5 = $student->createTable($db);

        $visitor = new \tailgate\Resource\Visitor;
        $t6 = $visitor->createTable($db);
    } catch (\Exception $e) {
        $db->buildTable('tg_game')->drop(true);
        $db->buildTable('tg_lot')->drop(true);
        $db->buildTable('tg_lottery')->drop(true);
        $db->buildTable('tg_spot')->drop(true);
        $db->buildTable('tg_student')->drop(true);
        $db->buildTable('tg_visitor')->drop(true);
        
        $db->rollback();
        throw $e;
    }
    $db->commit();

    $content[] = 'Tables created';
    return true;
}
