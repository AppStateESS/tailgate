<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends \phpws2\Resource
{
    
    /**
     * User id
     * @var \Variable\Integer
     */
    protected $user_id;
    
    /**
     * Username of student
     * @var \Variable\Alphanumeric
     */
    protected $username;

    /**
     * @var \Variable\TextOnly
     */
    protected $first_name;

    /**
     * @var \Variable\TextOnly
     */
    protected $last_name;

    /**
     * If false, student is ineligible for the current lottery
     * @var \Variable\Bool
     */
    protected $eligible;

    /**
     * Reason student was flagged as ineligible.
     * @var \Variable\StringVar
     */
    protected $ineligible_reason;

    /**
     * Number of student wins
     * @var \Variable\Integer
     */
    protected $wins;

    /**
     * If true, student has been banned from entering ANY lottery
     * @var \Variable\Bool
     */
    protected $banned;

    /**
     * Reason for ban
     * @var \Variable\StringVar
     */
    protected $banned_reason;

    /**
     * Timestamp of ban
     * @var \Variable\DateTime
     */
    protected $banned_date;

    /**
     * Timestamp of student account
     * @var \Variable\DateTime
     */
    protected $signup_date;
    
    /**
     * @var \Variable\Email
     */
    protected $email;
    
    protected $table = 'tg_student';

    public function __construct()
    {
        parent::__construct();
        $this->user_id = new \phpws2\Variable\IntegerVar(0, 'user_id');
        $this->username = new \phpws2\Variable\TextOnly(null, 'username');
        $this->username->setLimit(100);
        $this->username->setIsTableColumn(false);
        $this->first_name = new \phpws2\Variable\TextOnly(null, 'first_name');
        $this->first_name->setLimit(100);
        $this->last_name = new \phpws2\Variable\TextOnly(null, 'last_name');
        $this->last_name->setLimit(100);
        $this->eligible = new \phpws2\Variable\BooleanVar(true, 'eligible');
        $this->ineligible_reason = new \phpws2\Variable\TextOnly(null, 'ineligible_reason');
        $this->ineligible_reason->allowNull(true);
        $this->wins = new \phpws2\Variable\IntegerVar(0, 'wins');
        $this->wins->setRange(0, 100);
        $this->signup_date = new \phpws2\Variable\DateTime(null, 'signup_date');
        $this->banned = new \phpws2\Variable\BooleanVar(false, 'banned');
        $this->banned_reason = new \phpws2\Variable\TextOnly(null, 'banned_reason');
        $this->banned_reason->allowNull(true);
        $this->banned_date = new \phpws2\Variable\DateTime(0, 'banned_date');
        $this->email = new \phpws2\Variable\Email(null, 'email');
        $this->email->setIsTableColumn(false);
    }

    public function incrementWins()
    {
        $this->wins->increase();
    }

    public function getBanned()
    {
        return $this->banned->get();
    }

    public function getBannedReason()
    {
        return $this->banned_reason->get();
    }

    public function getBannedDate($format = null)
    {
        if ($format) {
            $this->banned_date->setFormat($format);
            return $this->banned_date->__toString();
        } else {
            return $this->banned_date->get();
        }
    }

    public function getEligible()
    {
        return $this->eligible->get();
    }

    public function getEmail()
    {
        return $this->email->get();
    }

    public function getFirstName()
    {
        return $this->first_name->get();
    }

    public function getIneligibleReason()
    {
        return $this->ineligible_reason->get();
    }

    public function getLastName()
    {
        return $this->last_name->get();
    }
    
    public function getSignupDate($format = null)
    {
        if ($format) {
            $this->signup_date->setFormat($format);
            return $this->signup_date->__toString();
        } else {
            return $this->signup_date->get();
        }
    }

    public function getUsername()
    {
        return $this->username->get();
    }
    
    public function getUserId()
    {
        return $this->user_id->get();
    }

    public function getWins()
    {
        return $this->wins->get();
    }

    public function setBanned($banned)
    {
        $this->banned->set((bool) $banned);
    }

    public function setBannedReason($reason)
    {
        $this->banned_reason->set($reason);
    }

    public function setEligible($eligible)
    {
        $this->eligible->set($eligible);
    }
    
    public function setEmail($email)
    {
        $this->email->set($email);
    }
    
    public function setFirstName($first_name)
    {
        $this->first_name->set($first_name);
    }

    public function setIneligibleReason($reason)
    {
        $this->ineligible_reason->set($reason);
    }

    public function setLastName($last_name)
    {
        $this->last_name->set($last_name);
    }
    
    public function setUserId($user_id)
    {
        $this->user_id->set($user_id);
    }

    public function setUsername($username)
    {
        $this->username->set($username);
    }

    public function setWins($wins)
    {
        $this->wins->set($wins);
    }

    public function stampSignupDate()
    {
        $this->signup_date->stamp();
    }

    public function stampBanned()
    {
        $this->banned_date->stamp();
    }

}
