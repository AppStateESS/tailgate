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
        $game['pickup_deadline_format'] = strftime(TAILGATE_TIME_FORMAT . ', ' . TAILGATE_DATE_FORMAT, $game['pickup_deadline']);

        $game['kickoff_ts'] = strftime('%Y/%m/%d', $game['kickoff']);
        $game['signup_start_ts'] = strftime('%Y/%m/%d %H:%M', $game['signup_start']);
        $game['signup_end_ts'] = strftime('%Y/%m/%d %H:%M', $game['signup_end']);
        $game['pickup_deadline_ts'] = strftime('%Y/%m/%d %H:%M', $game['pickup_deadline']);
        return $game;
    }

    public function addVisitorInformation($game)
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_visitor');
        $tbl->addFieldConditional('id', $game['visitor_id']);
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
        $pickup_deadline = filter_input(INPUT_POST, 'pickup_deadline', FILTER_SANITIZE_NUMBER_INT);

        $game->setVisitorId($visitor_id);
        $game->setKickoff((int) $kickoff);
        $game->setSignupStart((int) $signup_start);
        $game->setSignupEnd((int) $signup_end);
        $game->setPickupDeadline((int) $pickup_deadline);
        self::saveResource($game);
    }

    /**
     * 
     * @return \tailgate\Resource\Game
     */
    public static function getCurrent()
    {
        static $current_game;
        
        if (!empty($current_game)) {
            return  $current_game;
        }
        
        $game = new Resource;

        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl2 = $db->addTable('tg_visitor');
        $tbl2->addField('university');
        $tbl2->addField('mascot');
        $cd = $db->createConditional($tbl->getField('visitor_id'), $tbl2->getField('id'), '=');
        $db->joinResources($tbl, $tbl2, $cd);

        $tbl->addFieldConditional('completed', 0);
        $row = $db->selectOneRow();

        if (empty($row)) {
            return null;
        }
        $game->setVars($row);
        $current_game = $game;
        return $game;
    }

    public static function getCurrentId()
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl->addFieldConditional('completed', 0);
        $tbl->addField('id');
        $row = $db->selectColumn();
        return $row;
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

    public static function completeLottery($game_id)
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl->addFieldConditional('id', (int) $game_id);
        $tbl->addValue('lottery_run', 1);
        $db->update();
    }

    public static function resetEligibility($game_id)
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_student');
        $tbl->addValue('eligible', 1);
        $tbl->addValue('ineligible_reason', '');
        $db->update();
    }
    
    /**
     * Removes game from system, clears all lottery entries, and resets 
     * all student eligibility.
     * @param integer $game_id
     */
    public static function completeGame($game_id)
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl->addFieldConditional('id', (int) $game_id);
        $db->delete();
        
        self::clearLottery();
        
        self::resetEligibility($game_id);
    }

    public static function getById($id)
    {
        $game = new Resource;

        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_game');
        $tbl2 = $db->addTable('tg_visitor');
        $tbl2->addField('university');
        $tbl2->addField('mascot');
        $cd = $db->createConditional($tbl->getField('visitor_id'), $tbl2->getField('id'), '=');
        $db->joinResources($tbl, $tbl2, $cd);

        $tbl->addFieldConditional('id', $id);
        $row = $db->selectOneRow();

        if (empty($row)) {
            return null;
        }
        $game->setVars($row);
        return $game;
    }

    public static function clearLottery()
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->truncate();
    }
    
    public static function getGameStatus(\tailgate\Resource\Game $game)
    {
        $color = null;
        $status = null;
        $gamevars = $game->getStringVars();
        $gameinfo = '<p>' . $gamevars['university'] . '<br />' . $gamevars['mascot'] .
                '<br />' . $gamevars['kickoff_format'] . '</p>';

        $now = time();

        
        $start = $game->getSignupStart();
        $end = $game->getSignupEnd();
        $pickup = $game->getPickupDeadline();
        $kickoff = $game->getKickoff();

        if ($start > $now) {
            $status = 'Signup starts on ' . strftime(TAILGATE_TIME_FORMAT, $start) . ', ' .
                    strftime(TAILGATE_DATE_FORMAT, $start);
            $color = 'info';
        } elseif ($end > $now) {
            $status = 'Signup available until ' . strftime(TAILGATE_TIME_FORMAT, $end) . ', ' .
                    strftime(TAILGATE_DATE_FORMAT, $end);
            $color = 'success';
        } elseif ($pickup > $now) {
            if ($game->getLotteryRun()) {
                $status = 'Lottery complete. Winners may pick up tickets until ' . strftime(TAILGATE_TIME_FORMAT, $pickup) . ', ' .
                        strftime(TAILGATE_DATE_FORMAT, $pickup);
                $color = 'danger';
            } else {
                $status = 'Lottery to be run soon! Check back later to see if you won.';
                $color = 'warning';
            }
        } elseif ($kickoff > $now) {
            $status = 'Lottery process complete. Pickup deadline has passed. Unclaimed spaces offered on first come, first serve basis.';
            $color = 'info';
        } else {
            $gameinfo = null;
            $status = 'No game currently scheduled';
            $color = 'success';
        }

        $gameinfo .= "<div style='white-space:normal' class='alert alert-$color'>$status</div>";

        return $gameinfo;
    }
    
    public static function isAfterPickup()
    {
        $game = self::getCurrent();
        return $game->getPickupDeadline() < time();
    }
}
