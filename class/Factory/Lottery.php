<?php

namespace tailgate\Factory;

use tailgate\Resource\Lottery as Resource;
use tailgate\Factory\Game as GameFactory;
use tailgate\Factory\Student as StudentFactory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends Base
{

    public function getByStudentId($student_id, $game_id = null)
    {
        if (empty($game_id)) {
            $game = GameFactory::getCurrent();
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
        $gameFactory = new GameFactory;
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
        $currentGame = GameFactory::getCurrent();
        $total_spots = $this->totalAvailableSpots();

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addField('id');
        $tbl->addField('student_id');
        $tbl->addFieldConditional('winner', 0);
        $tbl->addFieldConditional('game_id', $currentGame->getId());
        $tbl->randomOrder();

        for ($i = 0; $i < $total_spots; $i++) {
            $row = $db->selectOneRow();
            if ($row['id']) {
                $this->flagWinner($row['id']);
                Student::incrementWins($row['student_id']);
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
        if (empty($game_id)) {
            $game = GameFactory::getCurrent();
            $game_id = $game->getId();
        }
        $game = GameFactory::completeLottery($game_id);
    }

    public function completeGame($game_id = 0)
    {
        if (empty($game_id)) {
            $game_id = GameFactory::getCurrentId();
        }
        $game = GameFactory::completeGame($game_id);
    }

    public static function getAvailableSpots($game_id = 0, $lot_id = 0, $allow_reserved = false)
    {
        if (empty($game_id)) {
            $factory = new GameFactory;
            $game = GameFactory::getCurrent();
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
        $spotTable->addField('sober');

        $spotTable->addFieldConditional('active', 1);
        if (!$allow_reserved) {
            $spotTable->addFieldConditional('reserved', 0);
        }
        $cond = $db->createConditional($spotTable->getField('lot_id'), $lotTable->getField('id'), '=');
        $db->joinResources($spotTable, $lotTable, $cond);
        $expression = new \Database\Expression('(' . $db2->selectQuery() . ')');
        $spotTable->addFieldConditional('id', $expression, 'not in');

        return $db->select();
    }

    public function getAvailableLots($game_id = 0)
    {
        if (empty($game_id)) {
            $factory = new GameFactory;
            $game = GameFactory::getCurrent();
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

    public function pickSpot($lottery_id, $spot_id)
    {
        if (empty($lottery_id)) {
            throw new \Exception('Missing lottery id');
        }

        if (empty($spot_id)) {
            throw new \Exception('Missing spot id');
        }

        $lottery = new Resource;
        $lottery->setId($lottery_id);
        $this->load($lottery);
        $lot_id = Spot::getLotIdFromId($spot_id);
        if (empty($lot_id)) {
            throw new \Exception('Unknown spot id: ' . $spot_id);
        }

        if (self::spotTaken($spot_id)) {
            return false;
        } else {
            $lottery->setSpotId($spot_id);
            $lottery->setLotId($lot_id);
            self::saveResource($lottery);
            return true;
        }
    }

    public static function spotTaken($spot_id)
    {
        $game_id = \tailgate\Factory\Game::getCurrentId();
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('game_id', $game_id);
        $tbl->addFieldConditional('spot_id', $spot_id);
        $result = $db->selectOneRow();
        return (bool) $result;
    }

    public function getSpotByLotteryId($lottery_id)
    {
        $lottery = new Resource;
        $lottery->setId($lottery_id);
        $this->load($lottery);

        $db = \Database::getDB();
        $spotTable = $db->addTable('tg_spot');
        $spotTable->addFieldConditional('id', $lottery->getSpotId());
        $lotTable = $db->addTable('tg_lot');
        $lotTable->addField('title');
        $cond = $db->createConditional($spotTable->getField('lot_id'), $lotTable->getField('id'), '=');
        $db->joinResources($spotTable, $lotTable, $cond);
        return $db->selectOneRow();
    }

    public function notify($game_id = 0)
    {
        if (empty($game_id)) {
            $game = GameFactory::getCurrent();
            $game_id = $game->getId();
        }

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('game_id', $game_id);
        $result = $db->select();

        if (empty($result)) {
            return null;
        }

        $game = Game::getById($game_id);
        foreach ($result as $row) {
            if ($row['winner'] == '1') {
                $this->sendWinnerEmail($row, $game);
            } else {
                $this->sendLoserEmail($row, $game);
            }
        }
    }

    private function getSwiftTransport()
    {
        static $transport;

        if (!empty($transport)) {
            return $transport;
        }

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
        return $transport;
    }

    private function sendWinnerEmail($lottery, \tailgate\Resource\Game $game)
    {
        $variables = $game->getStringVars();
        $variables['confirmation_link'] = \Server::getSiteUrl() . 'tailgate/User/Lottery/?command=confirm&amp;hash=' .
                $lottery['confirmation'];
        $tpl = new \Template();
        $tpl->setModuleTemplate('tailgate', 'Admin/Lottery/Winner.html');
        $tpl->addVariables($variables);
        $content = $tpl->get();

        $this->sendEmail('Tailgate successful', $lottery['student_id'], $content);
    }

    private function sendLoserEmail($lottery, \tailgate\Resource\Game $game)
    {
        $variables = $game->getStringVars();
        $tpl = new \Template();
        $tpl->setModuleTemplate('tailgate', 'Admin/Lottery/Loser.html');
        $tpl->addVariables($variables);
        $content = $tpl->get();

        $this->sendEmail('Tailgate unsuccessful', $lottery['student_id'], $content);
    }

    private function sendEmail($subject, $student_id, $content)
    {
        $transport = $this->getSwiftTransport();
        $student = StudentFactory::getById($student_id);

        $message = \Swift_Message::newInstance();
        $message->setSubject($subject);
        $message->setFrom(\Settings::get('tailgate', 'reply_to'));
        $message->setTo($student->getEmail());
        $message->setBody($content, 'text/html');

        $mailer = \Swift_Mailer::newInstance($transport);
        $mailer->send($message);
    }

    public function confirm($hash)
    {
        $gfactory = new GameFactory;
        $game = $gfactory->getCurrent();
        $db = \Database::getDB();
        $t = $db->addTable('tg_lottery');
        $t->addFieldConditional('game_id', $game->getId());
        $t->addFieldConditional('confirmation', $hash);
        $t->addValue('confirmed', 1);
        $db->update();
    }

    public function isWinner($game_id, $student_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('game_id', $game_id);
        $tbl->addFieldConditional('student_id', $student_id);
        $tbl->addFieldConditional('winner', 1);
        $row = $db->selectOneRow();
        return (bool) $row;
    }

    public static function getStudentStatus()
    {
        if (\Current_User::isLogged()) {
            $content = '<a class="btn btn-primary btn-sm" href="./tailgate">Check lottery status</a>';
        } else {
            $content = '<a class="btn btn-primary btn-sm" href="./admin">Login</a>';
        }
        return $content;
    }

    public function pickedUp($lottery_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addValue('picked_up', 1);
        $tbl->addFieldConditional('id', $lottery_id);
        $db->update();
    }

    public static function getTotalSubmissions($game_id)
    {
        if (empty($game_id)) {
            throw new \Exception('Game id is zero');
        }
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('game_id', $game_id);
        $tbl->addField('id', 'count')->showCount(true);
        $count = $db->selectColumn();
        return $count;
    }

    /**
     * 
     * @param type $student_id
     * @return \tailgate\Resource\Lottery
     */
    public static function getLotteryByStudentId($student_id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_lottery');
        $tbl->addFieldConditional('student_id', $student_id);
        $row = $db->selectOneRow();
        if (!$row) {
            return null;
        }
        $lottery = new Resource;
        $lottery->setVars($row);
        return $lottery;
    }

    public static function assignStudent($student_id, $spot_id)
    {
        $game_id = Game::getCurrentId();
        $lot_id = Spot::getLotIdFromId($spot_id);

        $lottery = self::getLotteryByStudentId($student_id);
        if ($lottery) {
            $lottery->setLotId($lot_id);
            $lottery->setSpotId($spot_id);
        } else {
            $lottery = new Resource;
            $lottery->setGameId($game_id);
            $lottery->setStudentId($student_id);
            $lottery->setLotId($lot_id);
            $lottery->setSpotId($spot_id);
            $lottery->setWinner(true);
        }
        self::saveResource($lottery);
        return true;
    }

}
