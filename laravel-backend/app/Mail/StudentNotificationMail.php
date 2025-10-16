<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StudentNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $studentName;
    public $title;
    public $content;
    public $teacherName;
    public $className;

    public function __construct($studentName, $title, $content, $teacherName, $className)
    {
        $this->studentName = $studentName;
        $this->title = $title;
        $this->content = $content;
        $this->teacherName = $teacherName;
        $this->className = $className;
    }

    public function build()
    {
        return $this->subject("📢 Thông báo mới từ {$this->teacherName} – {$this->className}")
            ->markdown('emails.student-notification');
    }
}