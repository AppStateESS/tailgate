<?php

namespace tailgate\Controller\User;

use tailgate\Factory\Student as Factory;
use tailgate\Resource\Student as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends Base
{

    public function getHtmlView($data, \Request $request)
    {
        if (!$request->isVar('command')) {
            $command = 'landing';
        } else {
            $command = $request->getVar('command');
        }


        switch ($command) {
            case 'landing':
                $content = $this->landing();
        }

        $view = new \View\HtmlView($content);
        return $view;
    }

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'content':
                $json = $this->getContent();
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
            case 'createNewAccount':
                $factory->postNewStudent();
                \PHPWS_Core::reroute('tailgate/');
                break;
        }

        return $response;
    }
    
    private function getContent()
    {
        $json['welcome'] = \Settings::get('tailgate', 'welcome');

        return $json;
    }

    private function landing()
    {
        $factory = new Factory;

        if (\Current_User::isLogged()) {
            if ($factory->hasAccount(\Current_User::getUsername())) {
                return $this->showStatus();
            } else {
                return $this->createAccount();
            }
        } else {
            return $this->newAccountInformation();
        }
    }

    private function showStatus()
    {
        $template = new \Template;
        $template->setModuleTemplate('tailgate', '');
    }

    private function createAccount()
    {
        javascript('jquery');
        $development = true;

        if ($development) {
            $script_file = 'src/script.jsx';
            $type = 'text/jsx';
        } else {
            $script_file = 'build/script.js';
            $type = 'text/javascript';
        }

        $data['development'] = $development;
        $data['addons'] = true;
        javascript('react', $data);
        $script = '<script type="' . $type . '" src="' . PHPWS_SOURCE_HTTP .
                'mod/tailgate/javascript/User/Signup/' . $script_file . '"></script>';
        \Layout::addJSHeader($script);

        $content = <<<EOF
<h2>New account signup</h2>
<div id="studentSignup"></div>
EOF;

        return $content;
    }

    private function newAccountInformation()
    {
        $content = \Settings::get('tailgate', 'new_account_information');
        $content .= '<div class="text-center"><a class="btn btn-primary btn-lg" href="' . PHPWS_SOURCE_HTTP . 'admin/">Click to login</a></div>';
        return $content;
    }

}
