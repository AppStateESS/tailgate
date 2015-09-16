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
     * If true, the spot is reserved and not available in lottery
     * @var Variable\Bool
     */
    protected $reserved;

    /**
     * If true, spot may be included in lottery.
     * @var Variable\Bool
     */
    protected $active;
    
    protected $table = 'tg_spot';

    public function __construct()
    {
        parent::__construct();
        $this->lot_id = new \Variable\Integer(null, 'lot_id');
        $this->number = new \Variable\Integer(null, 'number');
        $this->reserved = new \Variable\Bool(false, 'reserved');
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

    public function getReserved()
    {
        return $this->reserved->get();
    }

    public function setLotId($lot_id)
    {
        $this->lot_id->set($lot_id);
    }

    public function setNumber($number)
    {
        $this->number->set($number);
    }

    public function setReserved($reserved)
    {
        $this->reserved->set($reserved);
    }

}
