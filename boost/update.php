<?php

use \phpws2\Database;

function tailgate_update(&$content, $currentVersion)
{
    switch ($currentVersion) {
        case (version_compare($currentVersion, '1.1.0', '<')):
            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_student');
            $column = $tbl->getDataType('user_id');
            $unique = new \phpws2\Database\Unique($column);
            $unique->add();
            $content[] = <<<EOF
<pre>
    +added unique index to user_id in tg_student
    +safety checks added
</pre>
EOF;
        case (version_compare($currentVersion, '1.2.0', '<')):
            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_game');
            $dt = new \phpws2\Database\Datatype\Smallint($tbl, 'lottery_started');
            $dt->setDefault(0);
            $dt->add();

            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_lottery');
            $dt = new \phpws2\Database\Datatype\Smallint($tbl, 'emailed');
            $dt->setDefault(0);
            $dt->add();

            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_lottery');
            $columns[] = $tbl->getDataType('student_id');
            $columns[] = $tbl->getDataType('game_id');
            $unique = new \phpws2\Database\Unique($columns);
            $unique->add();

            $content[] = <<<EOF
<pre>
    + Flagging beginning of lottery
    + Logging winner emails
    + Unique keys added to tg_lottery to prevent repeats
</pre>
EOF;
        case (version_compare($currentVersion, '1.2.1', '<')):
            $content[] = '<pre>+ Fixed spot report bug</pre>';

        case (version_compare($currentVersion, '1.2.3', '<')):
            $content[] = '<pre>+ Travis fixes</pre>';

        case (version_compare($currentVersion, '1.2.4', '<')):
            $content[] = '<pre>+ Removed wkpdftohtml to use dompdf.</pre>';

        case (version_compare($currentVersion, '1.3.0', '<')):
            $db = Database::getDB();
            $tbl = $db->addTable('tg_student');
            $newdt = new \phpws2\Database\Datatype\Text($tbl, '');
            $newdt->setIsNull(true);
            $tbl->alter($tbl->getDataType('ineligible_reason'), $newdt);
            $tbl->alter($tbl->getDataType('banned_reason'), $newdt);
            
            $content[] = <<<EOF
<pre>
+ Fixed date time picker.
+ Added FakeSwiftMailer for testing.
+ Student banned reasons set to default null.
+ Fixed error check.
</pre>
EOF;
    }
    return true;
}
