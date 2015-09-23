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

    public function getByUsername($username)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_student');
        $tbl->addFieldConditional('username', $username);
        $result = $db->selectOneRow();
        if (empty($result)) {
            return null;
        }
        $student = new Resource;
        $student->setVars($result);
        return $student;
    }

    public function getCurrentStudent()
    {
        return $this->getByUsername(\Current_User::getUsername());
    }

    public function postNewStudent()
    {
        $student = new Resource;

        $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
        if (empty($username)) {
            $username = \Current_User::getUsername();
        }
        $student->setUsername($username);
        $student->setFirstName(filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING));
        $student->setLastName(filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING));
        $student->stampSignupDate();

        self::saveResource($student);
    }

    public function getList($mode = TG_LIST_ALL, $order_by = null, $order_dir = 'asc')
    {
        if (empty($order_by)) {
            $order_by = 'last_name';
        }
        $db = $this->getListDB($mode, $order_by, $order_dir);
        $tbl = $db->getTable($this->table);

        $limit = filter_input(INPUT_GET, 'limit', FILTER_SANITIZE_NUMBER_INT);
        if (empty($limit)) {
            $limit = 50;
        }

        $search = filter_input(INPUT_GET, 'search', FILTER_SANITIZE_STRING);

        if (!empty($search)) {
            $c1 = $db->createConditional($tbl->getField('first_name'), "%$search%", 'like');
            $c2 = $db->createConditional($tbl->getField('last_name'), "%$search%", 'like');
            $c3 = $db->createConditional($tbl->getField('username'), "%$search%", 'like');
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
        $db = \Database::getDB();
        $student = $db->addTable('tg_student');
        $users = $db->addTable('users');
        $users->addField('email');
        
        $conditional = $db->createConditional($student->getField('username'), $users->getField('username'));
        $db->joinResources($student, $users, $conditional);
        
        $row = $db->selectOneRow();
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
        $student = new Resource;
        $student->setId($student_id);
        self::deleteResource($student);
    }

}
