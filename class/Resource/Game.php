<?php

namespace tailgate\Resource;

/**
 * Information on game played on campus.
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Game extends \phpws2\Resource
{
    /**
     * Id of Visitor record
     * @var \Variable\Integer
     */
    protected $visitor_id;

    /**
     * Unix time of kick off
     * @var \Variable\DateTime
     */
    protected $kickoff;

    /**
     * Unix time of start time
     * @var \Variable\DateTime
     */
    protected $signup_start;

    /**
     * Unix time of end time
     * @var \Variable\DateTime
     */
    protected $signup_end;

    /**
     * Unix time of deadline for pickup
     * @var \Variable\DateTime
     */
    protected $pickup_deadline;
    
    /**
     * If true, the game is complete
     * @var \Variable\Bool
     */
    protected $completed;
    /**
     * If true, the lottey is complete
     * @var \Variable\Bool
     */
    protected $lottery_run;
    
    /**
     * If true, the lottery has started
     * @var \Variable\Bool
     */
    protected $lottery_started;
    
    protected $table = 'tg_game';
    protected $university;
    protected $mascot;

    public function __construct()
    {
        parent::__construct();
        $this->visitor_id = new \phpws2\Variable\IntegerVar(null, 'visitor_id');
        $this->kickoff = new \phpws2\Variable\DateTime(null, 'kickoff');
        $this->kickoff->setFormat('%s');
        $this->signup_start = new \phpws2\Variable\DateTime(null, 'signup_start');
        $this->signup_start->setFormat('%s');
        $this->signup_end = new \phpws2\Variable\DateTime(null, 'signup_end');
        $this->signup_end->setFormat('%s');
        $this->pickup_deadline = new \phpws2\Variable\DateTime(null, 'pickup_deadline');
        $this->pickup_deadline->setFormat('%s');
        $this->lottery_run = new \phpws2\Variable\BooleanVar(false, 'lottery_run');
        $this->lottery_started = new \phpws2\Variable\BooleanVar(false, 'lottery_started');
        $this->completed = new \phpws2\Variable\BooleanVar(false, 'completed');
        $this->university = new \phpws2\Variable\StringVar(null, 'university');
        $this->university->setIsTableColumn(false);
        $this->mascot = new \phpws2\Variable\StringVar(null, 'mascot');
        $this->mascot->setIsTableColumn(false);
    }

    public function getCompleted()
    {
        return $this->completed->get();
    }

    public function getKickoff()
    {
        return $this->kickoff->get();
    }

    public function getLotteryRun()
    {
        return $this->lottery_run->get();
    }
    
    public function getLotteryStarted()
    {
        return $this->lottery_started->get();
    }
    
    public function getMascot()
    {
        return $this->mascot;
    }

    public function getPickupDeadline()
    {
        return $this->pickup_deadline->get();
    }
    
    public function getSignupEnd()
    {
        return $this->signup_end->get();
    }

    public function getSignupStart()
    {
        return $this->signup_start->get();
    }

    public function getUniversity()
    {
        return $this->university;
    }

    public function getVisitorId()
    {
        return $this->visitor_id->get();
    }

    public function setCompleted($completed)
    {
        $this->completed->set((bool) $completed);
    }

    public function setKickoff($date)
    {
        $this->kickoff->set($date);
    }

    public function setLotteryRun($run)
    {
        $this->lottery_run->set($run);
    }
    
    public function setLotteryStarted($started)
    {
        $this->lottery_started->set($started);
    }
    
    public function setMascot($mascot)
    {
        $this->mascot = $mascot;
    }
    
    public function setPickupDeadline($date)
    {
        $this->pickup_deadline->set($date);
    }

    public function setSignupStart($date)
    {
        $this->signup_start->set($date);
    }

    public function setSignupEnd($date)
    {
        $this->signup_end->set($date);
    }

    public function setUniversity($university)
    {
        $this->university = $university;
    }

    public function setVisitorId($id)
    {
        $this->visitor_id->set($id);
    }
    
    public function getStringVars($return_null = false, $hide = NULL)
    {
        $vars = parent::getStringVars();
        $factory = new \tailgate\Factory\Game;
        return $factory->gameTime($vars);
    }

}
