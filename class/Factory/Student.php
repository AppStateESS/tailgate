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

    public function hasAccount($username)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_student');
        $tbl->addFieldConditional('username', $username);
        $result = $db->selectOneRow();
        return (bool) $result;
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

    public function getList($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = $this->getListDB($mode, $order_by);
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
        //echo $db->selectQuery();exit;
        $result = $db->select();
        return $result;
    }
    
    public function ban($student_id, $reason)
    {
        $student = new Resource;
        self::loadByID($student, $student_id);
        $student->setBanned(true);
        $student->setBannedReason($reason);
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

}