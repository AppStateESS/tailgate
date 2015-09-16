<?php

namespace tailgate\Factory;

use tailgate\Resource\Lottery as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends Base
{

    public function getByStudentId($student_id, $game_id=null)
    {
        $factory = new \tailgate\Factory\Game;
        if (empty($game_id)) {
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }
        
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('student_id', $student_id);
        $tbl->addFieldConditional('game_id', $game_id);
        $row = $db->selectOneRow();
        if (empty($row)) {
            return null;
        }
        $lottery = new Resource;
        $lottery->setVars($row);
        return $lottery;
    }

    public function apply($game_id)
    {
        $studentFactory = new \tailgate\Factory\Student;
        $student = $studentFactory->getCurrentStudent();
        $student_id = $student->getId();
        $lotteryCheck = $this->getByStudentId($student_id);

        if (!empty($lotteryCheck)) {
            throw new \Exception('Already applied to this lottery');
        }

        $now = time();
        $game = new \tailgate\Resource\Game;
        $game->setId($game_id);
        $gameFactory = new \tailgate\Factory\Game;
        if (!$gameFactory->loadByID($game)) {
            throw new \Exception('Game does not exist.');
        }

        if ($game->getSignupStart() > $now) {
            throw new \Exception('Signup period has not started.');
        }

        if ($game->getSignupEnd() < $now) {
            throw new \Exception('Signup period is over.');
        }

        if ($game->getCompleted()) {
            throw new \Exception('This game lottery is complete. No more applications are allowed.');
        }

        $lottery = new Resource;
        $lottery->setGameId($game_id);
        $lottery->setStudentId($student_id);
        self::saveResource($lottery);
    }

    public function getLotteryEntry($game_id, $student_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('game_id', $game_id);
        $tbl->addFieldConditional('student_id', $student_id);
        $result = $db->selectOneRow();
        if (empty($result)) {
            return null;
        }
        $lottery = new Resource;
        $lottery->setVars($result);
        return $lottery;
    }

    public function totalAvailableSpots()
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_spot');
        $tbl->addFieldConditional('active', 1);
        $tbl->addFieldConditional('reserved', 0);
        $field = $tbl->addField('id', 'count');
        $field->showCount();
        $result = $db->selectColumn();
        return (int) $result;
    }

    /**
     * Randomly assigns winner status to lottery submissions in tg_lottery.
     * @return integer Number of spots filled
     */
    public function chooseWinners()
    {
        $gameFactory = new Game;
        $currentGame = $gameFactory->getCurrent();
        $total_spots = $this->totalAvailableSpots();

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addField('id');
        $tbl->addFieldConditional('winner', 0);
        $tbl->addFieldConditional('game_id', $currentGame->getId());
        $tbl->randomOrder();
        $result = $db->select();
        for ($i = 0; $i < $total_spots; $i++) {
            $id = $db->selectColumn();
            if ($id) {
                $this->flagWinner($id);
            } else {
                break;
            }
        }
        return $i;
    }

    public function flagWinner($lottery_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addValue('winner', 1);
        $tbl->addFieldConditional('id', $lottery_id);
        $db->update();
    }

    public function complete($game_id = 0)
    {
        $factory = new Game;
        if (empty($game_id)) {
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }
        $game = $factory->completeLottery($game_id);
    }

}
