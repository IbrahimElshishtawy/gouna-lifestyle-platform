<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthAndDashboardTest extends TestCase
{
    public function test_guest_is_redirected_to_admin_login_when_accessing_dashboard(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/admin/login');
    }

    public function test_login_screen_renders_successfully(): void
    {
        $response = $this->get('/admin/login');

        $response->assertStatus(200);
        $response->assertSee('GOUNOW Management');
        $response->assertSee('admin@gounow.com');
    }

    public function test_admin_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::where('email', 'admin@gounow.com')->first();

        $response = $this->post('/admin/login', [
            'email' => $user->email,
            'password' => 'WrongPassword!123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_super_admin_can_authenticate_and_access_dashboard(): void
    {
        $user = User::where('email', 'admin@gounow.com')->first();

        $response = $this->post('/admin/login', [
            'email' => 'admin@gounow.com',
            'password' => 'GouNow@2026!Secure',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('admin.dashboard'));

        $dashboardResponse = $this->actingAs($user)->get('/admin');
        $dashboardResponse->assertStatus(200);
        $dashboardResponse->assertSee('Gounow Super Admin');
        $dashboardResponse->assertSee('Executive Overview');
        $dashboardResponse->assertSee('Fanadir Bay Waterfront Villa');
    }

    public function test_bilingual_locale_switch_works(): void
    {
        $response = $this->get('/locale/ar');

        $response->assertSessionHas('locale', 'ar');

        $user = User::where('email', 'admin@gounow.com')->first();
        $arabicDashboard = $this->actingAs($user)->withSession(['locale' => 'ar'])->get('/admin');

        $arabicDashboard->assertStatus(200);
        $arabicDashboard->assertSee('dir="rtl"', false);
        $arabicDashboard->assertSee('لوحة التحكم');
    }

    public function test_admin_can_logout(): void
    {
        $user = User::where('email', 'admin@gounow.com')->first();

        $response = $this->actingAs($user)->post('/admin/logout');

        $this->assertGuest();
        $response->assertRedirect('/admin/login');
    }
}
