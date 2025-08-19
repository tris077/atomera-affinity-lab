import { JobStatus } from '@/components/StatusBadge';

export interface Job {
  id: string;
  name: string;
  proteinInput: string;
  proteinType: 'file' | 'text';
  ligandInput: string;
  ligandType: 'file' | 'text';
  notes?: string;
  status: JobStatus;
  created: Date;
  updated: Date;
  runtime?: number;
  bindingAffinity?: number;
  poses?: Array<{
    rank: number;
    score: number;
    id: string;
  }>;
}

const STORAGE_KEY = 'atomera_jobs';

class JobService {
  private jobs: Job[] = [];

  constructor() {
    this.loadJobs();
  }

  private loadJobs(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.jobs = parsed.map((job: any) => ({
          ...job,
          created: new Date(job.created),
          updated: new Date(job.updated)
        }));
      }
    } catch (error) {
      console.error('Failed to load jobs from storage:', error);
      this.jobs = [];
    }
  }

  private saveJobs(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.jobs));
    } catch (error) {
      console.error('Failed to save jobs to storage:', error);
    }
  }

  createJob(jobData: Omit<Job, 'id' | 'status' | 'created' | 'updated'>): Job {
    const job: Job = {
      ...jobData,
      id: this.generateId(),
      status: 'queued',
      created: new Date(),
      updated: new Date()
    };

    this.jobs.unshift(job);
    this.saveJobs();

    // Simulate job processing
    this.simulateJobProgress(job.id);

    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  getAllJobs(): Job[] {
    return [...this.jobs].sort((a, b) => b.updated.getTime() - a.updated.getTime());
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return undefined;

    this.jobs[index] = {
      ...this.jobs[index],
      ...updates,
      updated: new Date()
    };

    this.saveJobs();
    return this.jobs[index];
  }

  deleteJob(id: string): boolean {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.jobs.splice(index, 1);
    this.saveJobs();
    return true;
  }

  private generateId(): string {
    return 'job_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async simulateJobProgress(jobId: string): Promise<void> {
    // Simulate queued state for 1-3 seconds
    await this.delay(1000 + Math.random() * 2000);
    
    this.updateJob(jobId, { status: 'running' });

    // Simulate running state for 5-10 seconds
    await this.delay(5000 + Math.random() * 5000);

    // 90% success rate
    const success = Math.random() > 0.1;
    
    if (success) {
      this.updateJob(jobId, {
        status: 'completed',
        runtime: Math.floor(5000 + Math.random() * 15000),
        bindingAffinity: -8.2 + (Math.random() - 0.5) * 4,
        poses: Array.from({ length: 5 + Math.floor(Math.random() * 15) }, (_, i) => ({
          rank: i + 1,
          score: -6.0 - Math.random() * 3,
          id: `pose_${i + 1}_${jobId}`
        }))
      });
    } else {
      this.updateJob(jobId, { status: 'failed' });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const jobService = new JobService();