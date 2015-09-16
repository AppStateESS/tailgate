<?php

namespace tailgate\Factory;

use tailgate\Resource\Game as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Game extends Base
{
    protected $table = 'tg_game';

    public function getList($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = $this->getListDB(TG_LIST_ALL, 'kickoff', 'desc');

        $gtable = $db->getTable('tg_game');
        $gtable->addFieldConditional('completed', 1);
        $vtable = $db->addTable('tg_visitor');
        $vtable->addField('mascot');
        $vtable->addField('university');
        $c1 = $db->createConditional($gtable->getField('visitor_id'), $vtable->getField('id'));
        $db->joinResources($gtable, $vtable, $c1);
        $result = $db->select();
        if (empty($result)) {
            return null;
        }
        foreach ($result as $key => $row) {
            $result[$key] = $this->gameTime($row);
        }
        return $result;
    }

    public function gameTime($game)
    {
        $game['kickoff_format'] = strftime(TAILGATE_DATE_FORMAT, $game['kickoff']);
        $game['signup_start_format'] = strftime(TAILGATE_TIME_FORMAT . ', ' . TAILGATE_DATE_FORMAT, $game['signup_start']);
        $game['signup_end_format'] = strftime(TAILGATE_TIME_FORMAT . ', ' . TAILGATE_DATE_FORMAT, $game['signup_end']);

        $game['kickoff_ts'] = strftime('%Y/%m/%d', $game['kickoff']);
        $game['signup_start_ts'] = strftime('%Y/%m/%d %H:%M', $game['signup_start']);
        $game['signup_end_ts'] = strftime('%Y/%m/%d %H:%M', $game['signup_end']);
        return $game;
    }

    public function addVisitorInformation($game)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_visitor');
        $tbl->addFieldConditional('id', $game['id']);
        $row = $db->selectOneRow();
        $game['university'] = $row['university'];
        $game['mascot'] = $row['mascot'];
        return $game;
    }

    public function postNew()
    {
        $game = new Resource;
        $visitor_id = filter_input(INPUT_POST, 'visitor_id', FILTER_SANITIZE_NUMBER_INT);
        $kickoff = filter_input(INPUT_POST, 'kickoff', FILTER_SANITIZE_NUMBER_INT);
        $signup_start = filter_input(INPUT_POST, 'signup_start', FILTER_SANITIZE_NUMBER_INT);
        $signup_end = filter_input(INPUT_POST, 'signup_end', FILTER_SANITIZE_NUMBER_INT);

        $game->setVisitorId($visitor_id);
        $game->setKickoff((int) $kickoff);
        $game->setSignupStart((int) $signup_start);
        $game->setSignupEnd((int) $signup_end);
        self::saveResource($game);
    }

    public function getCurrent()
    {
        $game = new Resource;

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl2 = $db->addTable('tg_visitor');
        $cd = $db->createConditional($tbl->getField('visitor_id'), $tbl2->getField('id'), '=');
        $db->joinResources($tbl, $tbl2, $cd);
        $tbl2->addField('university');
        $tbl2->addField('mascot');

        $tbl->addFieldConditional('completed', 0);
        $row = $db->selectOneRow();
        if (empty($row)) {
            return null;
        }
        $game->setVars($row);
        return $game;
    }

    public function getCurrentAsArray()
    {
        $game = $this->getCurrent();
        if (empty($game)) {
            return null;
        }
        $vars = $game->getStringVars();
        return $vars;
    }
    
    public function completeLottery($game_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl->addFieldConditional('id', (int)$game_id);
        $tbl->addValue('completed', 1);
        $db->update();
    }

}
