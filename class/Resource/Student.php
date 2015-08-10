<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends \Resource
{
    /**
     * Username of student
     * @var \Variable\Alphanumeric
     */
    protected $username;
    protected $first_name;
    protected $last_name;
    
    /**
     * If false, student is ineligible for the current lottery
     * @var \Variable\Bool
     */
    protected $eligible;
    
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
    protected $table = 'tg_student';
    
    public function __construct()
    {
        $this->username = new \Variable\Alphanumeric(null, 'username');
        $this->first_name = new \Variable\String(null, 'first_name');
        $this->last_name = new \Variable\String(null, 'last_name');
        $this->eligible = new \Variable\Bool(true, 'eligible');
        $this->wins = new \Variable\Integer(0, 'wins');
        $this->banned = new \Variable\Bool(false, 'banned');
    }
}
