<?php

namespace tailgate\Resource;

/**
 * Information on parking lot
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lot extends \Resource
{
    /**
     * Name of parking lot
     * @var Variable\String
     */
    protected $title;
    
    /**
     * Total number spaces the lot contains
     * @var Variable\Integer
     */
    protected $total_spaces;
    
    /**
     * Spaces not available for lottery
     * @var Variable\Integer
     */
    protected $reserved_spaces;
    
    /**
     * If true, lot is available for lottery
     * @var Variable\Bool
     */
    protected $active;
    
    protected $table = 'tg_lot';
    
    public function __construct()
    {
        $this->title = new \Variable\TextOnly(null, 'title');
        $this->total_spaces = new \Variable\Integer(0, 'total_spaces');
        $this->available_spaces = new \Variable\Integer(0, 'available_spaces');
        $this->active = new \Variable\Bool(true, 'active');
    }
}
