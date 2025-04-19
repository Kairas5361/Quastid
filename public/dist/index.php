<?php
session_start();
require_once 'functions.php';

$clans = getClans();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klan Topluluğu</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Klan Topluluğu</h1>
        <nav>
            <?php if (isset($_SESSION['user'])): ?>
                <a href="logout.php">Çıkış Yap</a>
                <a href="create_clan.php">Klan Oluştur</a>
                <span>Hoş geldin, <?= htmlspecialchars($_SESSION['user']['username']) ?></span>
            <?php else: ?>
                <a href="login.php">Giriş Yap</a>
                <a href="register.php">Kayıt Ol</a>
            <?php endif; ?>
        </nav>
    </header>

    <main>
        <h2>Klanlar</h2>
        <div class="clan-list">
            <?php foreach ($clans as $clan): ?>
                <div class="clan-card">
                    <h3><a href="clan.php?id=<?= $clan['id'] ?>"><?= htmlspecialchars($clan['name']) ?></a></h3>
                    <p><?= htmlspecialchars($clan['description']) ?></p>
                    <small>Oluşturan: <?= htmlspecialchars($clan['creator']) ?></small>
                </div>
            <?php endforeach; ?>
        </div>
    </main>

    <footer>
        <p>&copy; 2023 Klan Topluluğu</p>
    </footer>
</body>
</html>
