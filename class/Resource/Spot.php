<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Spot extends \phpws2\Resource
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
     * Indicates spot is reserved for non-alcoholic tailgating
     * @var Variable\Bool
     */
    protected $sober;

    /**
     * If true, spot may be included in lottery.
     * @var Variable\Bool
     */
    protected $active;
    
    protected $table = 'tg_spot';

    public function __construct()
    {
        parent::__construct();
        $this->lot_id = new \phpws2\Variable\IntegerVar(null, 'lot_id');
        $this->number = new \phpws2\Variable\IntegerVar(null, 'number');
        $this->reserved = new \phpws2\Variable\BooleanVar(false, 'reserved');
        $this->sober = new \phpws2\Variable\BooleanVar(false, 'sober');
        $this->active = new \phpws2\Variable\BooleanVar(true, 'active');
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
    
    public function getSober()
    {
        return $this->sober->get();
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
    
    public function setSober($sober)
    {
        $this->sober->set($sober);
    }

}
