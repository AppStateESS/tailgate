<?php

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */

function tailgate_uninstall(&$content)
{
    $db = \phpws2\Database::newDB();

    $db->buildTable('tg_game')->drop(true);
    $db->buildTable('tg_lot')->drop(true);
    $db->buildTable('tg_lottery')->drop(true);
    $db->buildTable('tg_spot')->drop(true);
    $db->buildTable('tg_student')->drop(true);
    $db->buildTable('tg_visitor')->drop(true);
    return true;
}