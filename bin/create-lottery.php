#!/usr/bin/php
<?php
if (!isset($_SERVER['argv'])) {
    exit;
}
define('DB_DSN', 'mysql:host=localhost;dbname=phpwebsite');
define('DB_USERNAME', 'dbuser');
define('DB_PASSWORD', 'dbpass');

createRows();


/* functions below */

function createRows()
{
    $dbh = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);

    $game_id_result = $dbh->query('select max(id) from tg_game',
            PDO::FETCH_ASSOC);
    $lastGameId = $game_id_result->fetchColumn();

    $student_result = $dbh->query('select id from tg_student', PDO::FETCH_ASSOC);
    $lottery_insert = <<<EOF
    insert into tg_lottery
        (game_id, student_id)
        values
        ($lastGameId, :student_id)
EOF;
    $count = 0;
    while ($student_id = $student_result->fetchColumn()) {
        $count++;
        $lottery_stmt = $dbh->prepare($lottery_insert);
        $lottery_stmt->bindParam(':student_id', $student_id);
        $lottery_stmt->execute();
    }
    echo "$count lottery entries added.\n\n";
}
