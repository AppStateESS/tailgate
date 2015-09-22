<?php

namespace tailgate\Resource;

/**
 * Information on team playing on campus
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends \Resource
{
    /**
     * Name of university
     * @var Variable\String
     */
    protected $university;

    /**
     * Name of mascot
     * @var Variable\String
     */
    protected $mascot;

    /**
     * Image file for university
     * @var Variable\File
     */
    protected $image;
    
    protected $active;
    
    protected $table = 'tg_visitor';
    
    public function __construct()
    {
        parent::__construct();
        $this->university = new \Variable\String(null, 'university');
        $this->university->allowEmpty(false);
        $this->university->setLimit(100);
        $this->mascot = new \Variable\String(null, 'mascot');
        $this->mascot->allowEmpty(false);
        $this->mascot->setLimit(100);
        $this->active = new \Variable\Bool(true, 'active');
        $this->image = new \Variable\File(null, 'image');
        $this->image->allowNull(true);
    }
    
    public function getMascot()
    {
        return $this->mascot->get();
    }

    public function getUniversity()
    {
        return $this->university->get();
    }
    
    public function setMascot($mascot)
    {
        $this->mascot->set($mascot);
    }
    
    public function setUniversity($university)
    {
        $this->university->set($university);
    }

}
