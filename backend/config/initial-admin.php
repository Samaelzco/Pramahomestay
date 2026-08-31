<?php

return [
    'name' => env('ADMIN_NAME', 'Prama Administrator'),
    'email' => env('ADMIN_EMAIL', 'admin@gmail.com'),
    'password' => env('ADMIN_PASSWORD', 'password'),
    'role' => env('ADMIN_ROLE', 'admin'),
    'guard' => env('ADMIN_GUARD', 'web'),
];
