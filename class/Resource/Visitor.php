<?php

namespace tailgate\Resource;

/**
 * Information on team playing on campus
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends \phpws2\Resource
{
    /**
     * Name of university
     * @var Variable\StringVar
     */
    protected $university;

    /**
     * Name of mascot
     * @var Variable\StringVar
     */
    protected $mascot;

    /**
     * Image file for university
     * @var Variable\FileVar
     */
    protected $image;
    
    protected $active;
    
    protected $table = 'tg_visitor';
    
    public function __construct()
    {
        parent::__construct();
        $this->university = new \phpws2\Variable\StringVar(null, 'university');
        $this->university->allowEmpty(false);
        $this->university->setLimit(100);
        $this->mascot = new \phpws2\Variable\StringVar(null, 'mascot');
        $this->mascot->allowEmpty(false);
        $this->mascot->setLimit(100);
        $this->active = new \phpws2\Variable\BooleanVar(true, 'active');
        $this->image = new \phpws2\Variable\FileVar(null, 'image');
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
