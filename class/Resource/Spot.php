<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Spot extends \Resource
{
    /**
     * Spot's lot id number
     * @var \Variable\Integer
     */
    protected $lot_id;

    /**
     * Parking space number
     * @var \Variable\Alphanumeric
     */
    protected $number;
    
    /**
     * If true, student has picked up tailgate pass
     * @var Variable\Bool
     */
    protected $picked_up;

    /**
     * If true, the spot is reserved and not available in lottery
     * @var Variable\Bool
     */
    protected $reserved;
    
    /**
     * If true, student has selected this spot
     * @var Variable\Bool
     */
    protected $selected;
    
    /**
     *
     * @var Variable\Bool
     */
    protected $active;
    
    
    protected $table = 'tg_spot';

    public function __construct()
    {
        parent::__construct();
        $this->lot_id = new \Variable\Integer(null, 'lot_id');
        $this->number = new \Variable\Integer(null, 'number');
        $this->number->setLimit(999);
        $this->picked_up = new \Variable\Bool(false, 'picked_up');
        $this->reserved = new \Variable\Bool(false, 'reserved');
        $this->selected = new \Variable\Bool(false, 'selected');
        $this->active = new \Variable\Bool(true, 'active');
    }
    
    public function getLotId()
    {
        return $this->lot_id->get();
    }
    
    public function getNumber()
    {
        return $this->number->get();
    }
    
    public function getPickedUp()
    {
        return $this->picked_up->get();
    }

    public function getReserved()
    {
        return $this->reserved->get();
    }
    
    public function getSelected()
    {
        return $this->selected->get();
    }
    
    public function setLotId($lot_id)
    {
        $this->lot_id->set($lot_id);
    }
    
    public function setNumber($number)
    {
        $this->number->set($number);
    }
    
    public function setPickedUp($picked_up)
    {
        $this->picked_up->set($picked_up);
    }
    
    public function setReserved($reserved)
    {
        $this->reserved->set($reserved);
    }
    
    public function setSelected($selected)
    {
        $this->selected->set($selected);
    }
    
    

}
