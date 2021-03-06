<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends \phpws2\Resource
{
    /**
     * Id of game the student applied to
     * @var \Variable\Integer
     */
    protected $game_id;

    /**
     * Id of student from tg_student table
     * @var \Variable\Integer
     */
    protected $student_id;

    /**
     * Lot preference indicated on application. May not square with
     * final spot_id.
     * @var \Variable\Integer
     */
    protected $lot_id;

    /**
     * Id of spot won by student
     * @var \Variable\Integer
     */
    protected $spot_id;

    /**
     * Indicates if student has won a spot.
     * @var \Variable\Bool
     */
    protected $winner;

    /**
     * If true, student picked up tailgate ticket
     * @var \Variable\Bool
     */
    protected $picked_up;

    /**
     * Confirmation code expected from student to confirm they are coming
     * @var \Variable\HashVar
     */
    protected $confirmation;

    /**
     * Indicates the student confirmed their tailgate spot
     * @var \Variable\Bool
     */
    protected $confirmed;
    
    /**
     * Indicates the winner was contacted
     * @var \Variable\Bool
     */
    protected $emailed;
    
    protected $table = 'tg_lottery';

    public function __construct()
    {
        parent::__construct();
        $this->game_id = new \phpws2\Variable\IntegerVar(0, 'game_id');
        $this->student_id = new \phpws2\Variable\IntegerVar(0, 'student_id');
        $this->lot_id = new \phpws2\Variable\IntegerVar(0, 'lot_id');
        $this->spot_id = new \phpws2\Variable\IntegerVar(0, 'spot_id');
        $this->winner = new \phpws2\Variable\BooleanVar(false, 'winner');
        $this->picked_up = new \phpws2\Variable\BooleanVar(false, 'picked_up');
        $this->confirmation = new \phpws2\Variable\HashVar(null, 'confirmation');
        $this->confirmation->allowNull(true);
        $this->confirmation->setLimit(40);
        $this->confirmed = new \phpws2\Variable\BooleanVar(false, 'confirmed');
        $this->emailed = new \phpws2\Variable\BooleanVar(false, 'emailed');
    }

    public function createConfirmation()
    {
        $this->confirmation->md5Random();
    }

    public function getConfirmation()
    {
        return $this->confirmation->get();
    }

    public function getConfirmed()
    {
        return $this->confirmed->get();
    }

    public function getGameId()
    {
        return $this->game_id->get();
    }

    public function getSpotId()
    {
        return $this->spot_id->get();
    }

    public function getStudentId()
    {
        return $this->student_id->get();
    }

    public function getLotId()
    {
        return $this->lot_id->get();
    }

    public function getPickedUp()
    {
        return $this->picked_up->get();
    }
    
    public function getWinner()
    {
        return $this->winner->get();
    }
    
    public function getEmailed()
    {
        return $this->emailed->get();
    }

    public function setConfirmed($confirmed)
    {
        $this->confirmed->set($confirmed);
    }

    public function setGameId($game_id)
    {
        $this->game_id->set($game_id);
    }

    public function setLotId($lot_id)
    {
        $this->lot_id->set($lot_id);
    }

    public function setPickedUp($picked_up)
    {
        $this->picked_up->set($picked_up);
    }

    public function setSpotId($spot_id)
    {
        $this->spot_id->set($spot_id);
    }

    public function setStudentId($student_id)
    {
        $this->student_id->set($student_id);
    }
    
    public function setWinner($winner)
    {
        $this->winner->set($winner);
    }
    
    public function setEmailed($emailed)
    {
        $this->emailed->set($emailed);
    }

}
