<?php

namespace tailgate\Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends \Resource
{
    /**
     * Time students are allowed to send ticket to lottery
     * @var \Variable\DateTime
     */
    protected $signup_start;

    /**
     * Deadline for lottery ticket submission
     * @var \Variable\DateTime
     */
    protected $signup_end;
    protected $table = 'tg_lottery';
    
    public function __construct()
    {
        $this->signup_start = new \Variable\DateTime(0, 'signup_start');
        $this->signup_end = new \Variable\DateTime(0, 'signup_end');
    }

}
