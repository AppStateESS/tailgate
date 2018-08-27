<?php

namespace tailgate\Factory;

use tailgate\Resource\Student as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends Base
{

    protected $table = 'tg_student';

    public static function getCurrentStudent()
    {
        return self::getByUserId(\Current_User::getId());
    }

    public static function getByUserId($user_id)
    {
        if (!$user_id) {
            return null;
        }
        $db = \phpws2\Database::getDB();
        $student = $db->addTable('tg_student');
        $student->addFieldConditional('user_id', $user_id);
        $users = $db->addTable('users');
        $users->addField('email');
        $users->addField('username');

        $conditional = $db->createConditional($student->getField('user_id'),
                $users->getField('id'));
        $db->joinResources($student, $users, $conditional);
        $row = $db->selectOneRow();
        if (!$row) {
            return null;
        }
        $stdObj = new Resource;
        $stdObj->setVars($row);
        return $stdObj;
    }

    public function isStudent($username)
    {
        $url = TAILGATE_BANNER_URL . $username;
        $ch = curl_init($url);
        ob_start();
        $result = curl_exec($ch);
        $error = curl_error($ch);
        if (!empty($error)) {
            throw new \Exception('Could not contact Banner server.');
        }
        $jsonString = ob_get_clean();
        if (!$result) {
            return false;
        }
        $json = json_decode($jsonString);
        curl_close($ch);
        return $json->creditHoursEnrolled > 0;
    }

    public function postNewStudent($user_id)
    {
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_student');
        $tbl->addFieldConditional('user_id', $user_id);
        $result = $db->select();
        if ($result) {
            return;
        }

        $student = new Resource;

        $student->setFirstName(filter_input(INPUT_POST, 'firstName',
                        FILTER_SANITIZE_STRING));
        $student->setLastName(filter_input(INPUT_POST, 'lastName',
                        FILTER_SANITIZE_STRING));
        $student->setUserId($user_id);
        $student->stampSignupDate();

        self::saveResource($student);
    }

    public function getList($mode = TG_LIST_ALL, $order_by = null,
            $order_dir = 'asc')
    {
        $game = Game::getCurrent();

        if (empty($order_by)) {
            $order_by = 'last_name';
        }
        $db = $this->getListDB($mode, $order_by, $order_dir);
        $student = $db->getTable($this->table);
        $users = $db->addTable('users');
        $users->addField('email');
        $users->addField('username');
        $conditional = $db->createConditional($student->getField('user_id'),
                $users->getField('id'));
        $db->joinResources($student, $users, $conditional);

        // if game show if they won lottery
        if ($game) {
            $lottery = $db->addTable('tg_lottery');
            $lottery->addField('winner');
            $lottery->addField('picked_up');
            $s_l_cond = $db->createConditional($student->getField('id'),
                    $lottery->getField('student_id'));
            $db->joinResources($student, $lottery, $s_l_cond, 'left');
        }

        $limit = filter_input(INPUT_GET, 'limit', FILTER_SANITIZE_NUMBER_INT);
        if (empty($limit)) {
            $limit = 50;
        }

        $search = filter_input(INPUT_GET, 'search', FILTER_SANITIZE_STRING);

        if (!empty($search)) {
            $c1 = $db->createConditional($student->getField('first_name'),
                    "%$search%", 'like');
            $c2 = $db->createConditional($student->getField('last_name'),
                    "%$search%", 'like');
            $c3 = $db->createConditional($users->getField('username'),
                    "%$search%", 'like');
            $c4 = $db->createConditional($c1, $c2, 'or');
            $c5 = $db->createConditional($c3, $c4, 'or');
            $db->addConditional($c5);
        }
        $db->setLimit($limit);
        $result = $db->select();
        return $result;
    }

    public static function getById($student_id)
    {
        if (!$student_id) {
            return null;
        }
        $db = \phpws2\Database::getDB();
        $student = $db->addTable('tg_student');
        $student->addFieldConditional('id', $student_id);
        $users = $db->addTable('users');
        $users->addField('email');
        $users->addField('username');

        $conditional = $db->createConditional($student->getField('user_id'),
                $users->getField('id'));
        $db->joinResources($student, $users, $conditional);
        $row = $db->selectOneRow();
        if (!$row) {
            return $row;
        }
        $stdObj = new Resource;
        $stdObj->setVars($row);
        return $stdObj;
    }

    public function ban($student_id, $reason)
    {
        $student = new Resource;
        self::loadByID($student, $student_id);
        $student->setBanned(true);
        $student->setBannedReason(filter_var($reason, FILTER_SANITIZE_STRING));
        $student->setIneligibleReason('Banned');
        $student->stampBanned();
        $student->setEligible(false);
        self::saveResource($student);

        $gameId = Game::getCurrentId();
        if ($gameId) {
            Lottery::removeStudentWin($student_id, $gameId);
        }
    }

    public function unban($student_id)
    {
        $student = new Resource;
        self::loadByID($student, $student_id);
        $student->setBanned(false);
        $student->setBannedReason('');
        $student->stampBanned();
        $student->setEligible(true);
        self::saveResource($student);
    }

    public function ineligible($student_id, $reason)
    {
        $student = new Resource;
        self::loadByID($student, $student_id);
        $student->setEligible(false);
        $student->setIneligibleReason(filter_var($reason, FILTER_SANITIZE_STRING));
        self::saveResource($student);
    }

    public function eligible($student_id)
    {
        $student = new Resource;
        self::loadByID($student, $student_id);
        $student->setEligible(true);
        $student->setIneligibleReason('');
        self::saveResource($student);
    }

    public function delete($student_id)
    {
        $student = $this->getById($student_id);
        $userId = $student->getUserId();
        $user = new \PHPWS_User($userId);

        self::deleteResource($student);
        $db = \phpws2\Database::getDB();
        $lottery = $db->addTable('tg_lottery');
        $lottery->addFieldConditional('student_id', $student_id);
        $db->delete();

        // If current user is allowed to delete users and the student deleted is not a deity or a higher level admin THEN
        // remove the user record as well.
        if (\Current_User::allow('users', 'delete_users') && (!$user->isDeity() && !$user->allow('users') && !$user->allow('tailgate'))) {
            $user->kill();
        }
    }

    public static function incrementWins($student_id)
    {
        if (empty($student_id)) {
            throw new \Exception('Bad student id:' . $student_id);
        }
        $db = \phpws2\Database::getDB();
        $tbl = $db->addTable('tg_student');
        $tbl->addFieldConditional('id', $student_id);
        $wins = $tbl->getField('wins');
        $exp = new \phpws2\Database\Expression($wins . '+1');
        $tbl->addValue('wins', $exp);
        $db->update();
    }

}
