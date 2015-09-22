<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Settings as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Settings extends Base
{

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList();
                break;
            
            case 'testEmail':
                $json = array('success'=> filter_input(INPUT_GET, 'replyTo', FILTER_VALIDATE_EMAIL));
                break;
        }
        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Request $request)
    {
        $factory = new Factory;
        $view = new \View\JsonView(array('success' => true));
        $response = new \Response($view);

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'save':
                $factory->postSettings();
                break;
        }
        \PHPWS_Core::reroute('tailgate/Admin/');
    }
    
    

}
