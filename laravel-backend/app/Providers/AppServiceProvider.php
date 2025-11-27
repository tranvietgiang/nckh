<?php

namespace App\Providers;

use App\Interface\AuthInterface;
use App\Repositories\AuthRepository;
use App\Interface\NotificationInterface;
use App\Repositories\NotificationRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // auth bind
        $this->app->bind(
            AuthInterface::class,
            AuthRepository::class,
        );

        // notification bind
        $this->app->bind(
            NotificationInterface::class,
            NotificationRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}