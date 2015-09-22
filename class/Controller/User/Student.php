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

        switch ($command) {
            case 'content':
                $json = $this->getContent();
                break;

            case 'get':
                $json = $this->getStudent();
                break;
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    private function getStudent()
    {
        $factory = new Factory;
        $student = $factory->getCurrentStudent();
        if ($student) {
            return $student->getStringVars();
        } else {
            throw new \Exception('Incorrect student ID');
        }
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
            $student = $factory->getByUsername(\Current_User::getUsername());
            if ($student) {
                // student is logged in and has account
                return $this->showStatus($student->getId());
            } else {
                // student is logged in but doens't have an account
                return $this->createAccount();
            }
        } else {
            // student is not logged in
            return $this->newAccountInformation();
        }
    }

    private function showStatus($student_id)
    {
        \tailgate\Factory\React::load('User/Status/', true, true);
        javascript('jquery');
        $content = <<<EOF
<script type="text/javascript">var student_id='$student_id';</script>
<div id="studentStatus"></div>
EOF;

        return $content;
    }

    private function createAccount()
    {
        \tailgate\Factory\React::load('User/Signup/', true, true);

        javascript('jquery');

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
