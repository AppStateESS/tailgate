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
                break;
            
            default:
                echo \Server::pageNotFound();exit;
                break;
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
        $student = Factory::getCurrentStudent();
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
                $factory->postNewStudent(\Current_User::getId());
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
            if (!\Current_User::allow('tailgate') && !$factory->isStudent(\Current_User::getUsername())) {
                return $this->notStudentMessage();
            }
            $student = $factory->getCurrentStudent();
            if ($student) {
                // student is logged in and has account
                return $this->showStatus($student->getId());
            } else {
                // student is logged in but doesn't have an account
                return $this->createAccount();
            }
        } else {
            // student is not logged in
            return $this->newAccountInformation();
        }
    }
    
    private function notStudentMessage()
    {
        $email = \Settings::get('tailgate', 'reply_to');
        return <<<EOF
<h2>Sorry</h2>
<p>You are not listed as a student. Only students in good standing may participate in the tailgate lottery.</p>
<p>If you believe this is a mistake, please email <a href="$email">$email</a>.</p>
EOF;
    }

    private function showStatus($student_id)
    {
        $react = \tailgate\Factory\React::load('status', REACT_DEVMODE);
        javascript('jquery');
        $content = <<<EOF
<script type="text/javascript">var student_id='$student_id';</script>
<div id="student-status"></div>
$react
EOF;

        return $content;
    }

    private function createAccount()
    {
        $react = \tailgate\Factory\React::load('signup', REACT_DEVMODE);

        javascript('jquery');

        $content = <<<EOF
<h2>New account signup</h2>
<div id="student-signup"></div>
$react
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
