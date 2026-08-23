<?php

namespace App\Http\Controllers\Api\Internal;

use App\Contracts\Services\ReportServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ExportReportRequest;
use App\Http\Requests\Reports\IndexReportRequest;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportServiceInterface $reports,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function index(IndexReportRequest $request): JsonResponse
    {
        return response()->json(['data' => [
            ...$this->reports->summary($request->validated()),
            'can_export' => $request->user()->can('reports.export'),
        ]]);
    }

    public function export(ExportReportRequest $request): Response
    {
        $filters = $request->safe()->except('format');
        $format = $request->validated('format');
        $report = $this->reports->summary($filters);
        $filename = "laporan-prama-{$report['period']['start']}-{$report['period']['end']}.{$format}";
        $content = $format === 'pdf' ? $this->reports->pdf($filters) : $this->reports->csv($filters);
        $this->auditLogger->recordReportExport($format, $report['period']);

        return response($content, 200, [
            'Content-Type' => $format === 'pdf' ? 'application/pdf' : 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
