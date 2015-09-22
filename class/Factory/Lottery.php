<?php

namespace tailgate\Factory;

use tailgate\Resource\Lottery as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends Base
{

    public function getByStudentId($student_id, $game_id = null)
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

    public function apply($student_id, $game_id)
    {
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

    public function getEntry($game_id, $student_id)
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
        $confirmation = md5(randomString(10, true, true));
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addValue('winner', 1);
        $tbl->addValue('confirmation', $confirmation);
        $tbl->addFieldConditional('id', $lottery_id);
        $db->update();
    }

    public function completeLottery($game_id = 0)
    {
        $factory = new Game;
        if (empty($game_id)) {
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }
        $game = $factory->completeLottery($game_id);
    }

    public function completeGame($game_id = 0)
    {
        $factory = new Game;
        if (empty($game_id)) {
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }
        $game = $factory->completeGame($game_id);
    }

    public function getAvailableSpots($game_id = 0, $lot_id = 0)
    {
        if (empty($game_id)) {
            $factory = new \tailgate\Factory\Game;
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }

        $db2 = \Database::getDB();
        $lotteryTable = $db2->addTable('tg_lottery');
        $lotteryTable->addFieldConditional('game_id', $game_id);
        $lotteryTable->addFieldConditional('spot_id', 0, '!=');
        $lotteryTable->addField('spot_id');

        $db = \Database::getDB();
        $spotTable = $db->addTable('tg_spot');
        $lotTable = $db->addTable('tg_lot');

        $lot_id = (int) $lot_id;
        if ($lot_id) {
            $spotTable->addFieldConditional('lot_id', $lot_id);
        }
        $lotTable->addField('title', 'lot_title');
        $spotTable->addOrderBy('lot_id');
        $spotTable->addOrderBy('number');
        $spotTable->addField('number');
        $spotTable->addField('id');
        $spotTable->addField('lot_id');
        $spotTable->addFieldConditional('active', 1);
        $spotTable->addFieldConditional('reserved', 0);
        $cond = $db->createConditional($spotTable->getField('lot_id'), $lotTable->getField('id'), '=');
        $db->joinResources($spotTable, $lotTable, $cond);
        $expression = new \Database\Expression('(' . $db2->selectQuery() . ')');
        $spotTable->addFieldConditional('id', $expression, 'not in');

        return $db->select();
    }

    public function getAvailableLots($game_id = 0)
    {
        if (empty($game_id)) {
            $factory = new \tailgate\Factory\Game;
            $game = $factory->getCurrent();
            $game_id = $game->getId();
        }

        $db2 = \Database::getDB();
        $lotteryTable = $db2->addTable('tg_lottery');
        $lotteryTable->addFieldConditional('spot_id', 0, '!=');
        $lotteryTable->addFieldConditional('game_id', $game_id);
        $lotteryTable->addField('spot_id');

        $db = \Database::getDB();
        $spotTable = $db->addTable('tg_spot');
        $lotTable = $db->addTable('tg_lot');
        $lotTable->addField('title', 'lot_title');
        $spotTable->addOrderBy('lot_id');
        $spotTable->addField('id', 'available')->showCount();
        $spotTable->addField('lot_id');
        $spotTable->addFieldConditional('active', 1);
        $spotTable->addFieldConditional('reserved', 0);
        $cond = $db->createConditional($spotTable->getField('lot_id'), $lotTable->getField('id'), '=');
        $db->joinResources($spotTable, $lotTable, $cond);
        $expression = new \Database\Expression('(' . $db2->selectQuery() . ')');
        $spotTable->addFieldConditional('id', $expression, 'not in');
        $db->setGroupBy($spotTable->getField('lot_id'));

        return $db->select();
    }

    public function pickLot($lottery_id, $lot_id)
    {
        if (empty($lottery_id)) {
            throw new \Exception('Missing lottery id');
        }

        if (empty($lot_id)) {
            throw new \Exception('Missing lot id');
        }

        $lottery = new Resource;
        $lottery->setId($lottery_id);
        $this->load($lottery);

        $spots = $this->getAvailableSpots($lottery->getGameId(), $lot_id);
        if (empty($spots)) {
            throw new \Exception('No available spots');
        }
        $spot = array_pop($spots);
        $lottery->setSpotId($spot['id']);
        $lottery->setLotId($spot['lot_id']);
        $this->save($lottery);
        return $lottery->getSpotId();
    }

    public function getSpotByLotteryId($lottery_id)
    {
        $lottery = new Resource;
        $lottery->setId($lottery_id);
        $this->load($lottery);

        $db = \Database::getDB();
        $spotTable = $db->addTable('tg_spot');
        $lotTable = $db->addTable('tg_lot');
        $lotTable->addField('title');
        $cond = $db->createConditional($spotTable->getField('lot_id'), $lotTable->getField('id'), '=');
        $db->joinResources($spotTable, $lotTable, $cond);
        return $db->selectOneRow();
    }

    public function notify()
    {
        require_once PHPWS_SOURCE_DIR . 'lib/vendor/autoload.php';
        switch (SWIFT_MAIL_TRANSPORT_TYPE) {
            case 1:
                $transport = \Swift_SmtpTransport::newInstance(SWIFT_MAIL_TRANSPORT_PARAMETER);
                break;
            case 2:
                $transport = \Swift_SendmailTransport::newInstance(SWIFT_MAIL_TRANSPORT_PARAMETER);
                break;
            case 3:
                $transport = \Swift_MailTransport::newInstance();
                break;

            default:
                throw new \Exception('Wrong Swift Mail transport type');
        }

        $subject = 'Congratulations! You won a tailgating spot.';
        
        $message = \Swift_Message::newInstance();
        $message->setSubject($subject);
        $message->setFrom(\PHPWS_Settings::get('tailgate', 'from_address'));
        $message->setTo($to);
        $message->setBody($content, 'text/html');

        $mailer = \Swift_Mailer::newInstance($transport);
        $mailer->send($message);
    }

}
