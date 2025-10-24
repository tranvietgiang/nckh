<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [
            [
                'report_name' => 'Đồ án Quản lý sinh viên',
                'description' => 'Xây dựng hệ thống quản lý sinh viên sử dụng Laravel và MySQL.',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-01-10',
                'end_date' => '2025-02-20',
            ],
            [
                'report_name' => 'Hệ thống bán hàng trực tuyến',
                'description' => 'Thiết kế website bán hàng có tích hợp thanh toán trực tuyến.',
                'class_id' => 2,
                'status' => 'graded',
                'start_date' => '2025-02-01',
                'end_date' => '2025-03-10',
            ],
            [
                'report_name' => 'Ứng dụng đặt vé xem phim',
                'description' => 'Ứng dụng web đặt vé xem phim với React và Laravel API.',
                'class_id' => 3,
                'status' => 'rejected',
                'start_date' => '2025-03-05',
                'end_date' => '2025-04-15',
            ],
            [
                'report_name' => 'Hệ thống quản lý thư viện',
                'description' => 'Quản lý mượn trả sách, thành viên và kho sách của thư viện.',
                'class_id' => 1,
                'status' => 'graded',
                'start_date' => '2025-04-10',
                'end_date' => '2025-05-20',
            ],
            [
                'report_name' => 'Website học từ vựng tiếng Anh',
                'description' => 'Trang web giúp người học ghi nhớ từ vựng bằng flashcard và quiz.',
                'class_id' => 2,
                'status' => 'submitted',
                'start_date' => '2025-05-01',
                'end_date' => '2025-06-10',
            ],
            [
                'report_name' => 'Ứng dụng đặt đồ ăn trực tuyến',
                'description' => 'Cho phép người dùng đặt món và theo dõi đơn hàng theo thời gian thực.',
                'class_id' => 3,
                'status' => 'graded',
                'start_date' => '2025-06-05',
                'end_date' => '2025-07-15',
            ],
            [
                'report_name' => 'Quản lý điểm danh sinh viên bằng QR',
                'description' => 'Ứng dụng quét mã QR để điểm danh tự động trong lớp học.',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-07-01',
                'end_date' => '2025-08-10',
            ],
            [
                'report_name' => 'Hệ thống tư vấn chăm sóc cây trồng',
                'description' => 'AI hỗ trợ nông dân chẩn đoán bệnh cây và gợi ý cách chữa trị.',
                'class_id' => 2,
                'status' => 'graded',
                'start_date' => '2025-08-05',
                'end_date' => '2025-09-15',
            ],
            [
                'report_name' => 'Ứng dụng quản lý nhà trọ',
                'description' => 'Quản lý người thuê, hợp đồng, và hóa đơn điện nước.',
                'class_id' => 3,
                'status' => 'submitted',
                'start_date' => '2025-09-01',
                'end_date' => '2025-10-10',
            ],
            [
                'report_name' => 'Website chia sẻ công thức nấu ăn',
                'description' => 'Người dùng đăng tải, tìm kiếm và đánh giá công thức nấu ăn.',
                'class_id' => 1,
                'status' => 'graded',
                'start_date' => '2025-09-10',
                'end_date' => '2025-10-20',
            ],
            [
                'report_name' => 'Ứng dụng học lái xe mô phỏng 3D',
                'description' => 'Ứng dụng mô phỏng thực tế ảo giúp học viên luyện lái an toàn.',
                'class_id' => 2,
                'status' => 'rejected',
                'start_date' => '2025-10-01',
                'end_date' => '2025-11-10',
            ],
            [
                'report_name' => 'Quản lý dự án phần mềm nhóm',
                'description' => 'Theo dõi tiến độ, phân công công việc và đánh giá hiệu quả.',
                'class_id' => 3,
                'status' => 'graded',
                'start_date' => '2025-01-15',
                'end_date' => '2025-03-01',
            ],
            [
                'report_name' => 'Hệ thống hỗ trợ tuyển dụng IT',
                'description' => 'Nền tảng kết nối nhà tuyển dụng và ứng viên ngành CNTT.',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-03-05',
                'end_date' => '2025-04-25',
            ],
            [
                'report_name' => 'Website quản lý câu lạc bộ',
                'description' => 'Quản lý thành viên, sự kiện, tài chính và hoạt động câu lạc bộ.',
                'class_id' => 2,
                'status' => 'graded',
                'start_date' => '2025-05-10',
                'end_date' => '2025-06-25',
            ],
            [
                'report_name' => 'Ứng dụng học nhạc trực tuyến',
                'description' => 'Nền tảng học nhạc qua video và bài kiểm tra tương tác.',
                'class_id' => 3,
                'status' => 'submitted',
                'start_date' => '2025-07-01',
                'end_date' => '2025-08-20',
            ],
            [
                'report_name' => 'Hệ thống giám sát sức khỏe học sinh',
                'description' => 'Theo dõi chỉ số BMI, lịch tiêm chủng và sức khỏe định kỳ.',
                'class_id' => 1,
                'status' => 'graded',
                'start_date' => '2025-08-10',
                'end_date' => '2025-09-25',
            ],
            [
                'report_name' => 'Ứng dụng quản lý bài tập nhóm',
                'description' => 'Phân chia công việc, nhắc deadline, và tổng hợp kết quả nhóm.',
                'class_id' => 2,
                'status' => 'submitted',
                'start_date' => '2025-09-05',
                'end_date' => '2025-10-15',
            ],
            [
                'report_name' => 'Nền tảng chia sẻ ảnh thiên nhiên',
                'description' => 'Cộng đồng nhiếp ảnh gia chia sẻ ảnh phong cảnh và thiên nhiên.',
                'class_id' => 3,
                'status' => 'graded',
                'start_date' => '2025-09-15',
                'end_date' => '2025-10-30',
            ],
            [
                'report_name' => 'Ứng dụng quản lý học phí sinh viên',
                'description' => 'Theo dõi học phí, thông báo thanh toán và gửi biên lai tự động.',
                'class_id' => 1,
                'status' => 'submitted',
                'start_date' => '2025-10-01',
                'end_date' => '2025-11-15',
            ],
            [
                'report_name' => 'Hệ thống nhận diện biển số xe',
                'description' => 'Sử dụng AI nhận diện và lưu trữ biển số xe ra vào bãi giữ.',
                'class_id' => 2,
                'status' => 'graded',
                'start_date' => '2025-10-05',
                'end_date' => '2025-11-25',
            ],
        ];

        foreach ($reports as &$report) {
            $report['created_at'] = Carbon::now();
            $report['updated_at'] = Carbon::now();
        }

        DB::table('reports')->insert($reports);
    }
}
