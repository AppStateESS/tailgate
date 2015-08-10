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
    protected $table = 'tg_spot';

    public function __construct()
    {
        $this->number = new \Variable\Alphanumeric(null, 'number');
        $this->selected = new \Variable\Bool(null, 'picked_up');
        $this->picked_up = new \Variable\Bool(null, 'picked_up');
    }

}
