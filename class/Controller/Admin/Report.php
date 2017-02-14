<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Report as Factory;
use tailgate\Factory\Game as GameFactory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Report extends Base
{

    public function getHtmlView($data, \Canopy\Request $request)
    {
        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        $command = $request->getVar('command');
        
        switch ($command) {
            case 'pickup':
                $content = Factory::pickup(GameFactory::getCurrentId());
                break;
            
            case 'winners':
                $content = Factory::winners(GameFactory::getCurrentId());
                break;
            
            case 'spotReport':
                $content = Factory::spotReport(GameFactory::getCurrentId());
                break;
            
            default:
                throw new \Exception('Unknown report command');
        }
        
        $view = new \phpws2\View\HtmlView($content);
        return $view;
    }

}
