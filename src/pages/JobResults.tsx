import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { jobService } from '@/lib/jobService';
import StatusBadge from '@/components/StatusBadge';
import MolecularBackground from '@/components/MolecularBackground';
import { ArrowLeft, Download, Eye, BarChart3, Zap, Box } from 'lucide-react';

const JobResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const job = id ? jobService.getJob(id) : null;

  if (!job) {
    return <Navigate to="/jobs" replace />;
  }

  if (job.status !== 'completed') {
    return <Navigate to={`/job/${job.id}/status`} replace />;
  }

  const formatBindingAffinity = (affinity: number) => {
    return `${affinity.toFixed(2)} kcal/mol`;
  };

  const formatRuntime = (runtime: number) => {
    return `${(runtime / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MolecularBackground intensity="light" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="self-start">
              <Link to="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/85ff6cb2-f21e-49a1-9a52-13a6ff2a50ff.png" 
                alt="Atomera Logo" 
                className="h-8"
              />
              <div>
                <h1 className="text-3xl font-bold">{job.name}</h1>
                <p className="text-muted-foreground">Binding Affinity Results</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Header */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                Completed on {job.updated.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {job.bindingAffinity ? formatBindingAffinity(job.bindingAffinity) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Binding Affinity</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {job.poses?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Poses Generated</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tertiary">
                    {job.runtime ? formatRuntime(job.runtime) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Runtime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {job.poses?.length ? job.poses[0].score.toFixed(2) : 'N/A'}
                  </div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Results */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Binding Affinity Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Predicted Binding Affinity
                </CardTitle>
                <CardDescription>
                  Calculated using advanced molecular dynamics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
                    {job.bindingAffinity ? formatBindingAffinity(job.bindingAffinity) : 'N/A'}
                  </div>
                  <p className="text-muted-foreground">
                    This value represents the predicted free energy of binding between the protein and ligand.
                    More negative values indicate stronger binding.
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-sm">
                      {job.bindingAffinity && job.bindingAffinity < -6 ? 'Strong Binding' : 
                       job.bindingAffinity && job.bindingAffinity < -4 ? 'Moderate Binding' : 
                       'Weak Binding'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Poses */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-secondary rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  Top 5 Poses
                </CardTitle>
                <CardDescription>
                  Best scoring binding conformations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.poses && job.poses.length > 0 ? (
                  <div className="space-y-2">
                    {job.poses.slice(0, 5).map((pose) => (
                      <div key={pose.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="min-w-12">
                            #{pose.rank}
                          </Badge>
                          <span className="font-medium">Pose {pose.rank}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{pose.score.toFixed(2)} kcal/mol</div>
                          <Button variant="ghost" size="sm" className="h-6 text-xs">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No poses generated
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Poses Table */}
          {job.poses && job.poses.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Poses</CardTitle>
                <CardDescription>
                  Complete list of generated binding conformations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Pose ID</TableHead>
                      <TableHead>Score (kcal/mol)</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.poses.map((pose) => (
                      <TableRow key={pose.id}>
                        <TableCell>
                          <Badge variant="outline">#{pose.rank}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{pose.id}</TableCell>
                        <TableCell className="font-semibold">
                          {pose.score.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pose.score < -6 ? 'default' : pose.score < -4 ? 'secondary' : 'outline'}>
                            {pose.score < -6 ? 'High' : pose.score < -4 ? 'Medium' : 'Low'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Future Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card opacity-60">
              <CardHeader className="text-center">
                <div className="w-16 h-16 gradient-tertiary rounded-full flex items-center justify-center mx-auto mb-4 molecular-glow">
                  <Box className="h-8 w-8 text-tertiary-foreground" />
                </div>
                <CardTitle>3D Structure Viewer</CardTitle>
                <CardDescription>Interactive molecular visualization</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground">
                  Interactive 3D visualization of protein-ligand complexes
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card opacity-60">
              <CardHeader className="text-center">
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 molecular-glow">
                  <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle>Interaction Map</CardTitle>
                <CardDescription>Detailed binding site analysis</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground">
                  2D interaction diagrams and binding site heatmaps
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card opacity-60">
              <CardHeader className="text-center">
                <div className="w-16 h-16 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 molecular-glow">
                  <Download className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle>Export Results</CardTitle>
                <CardDescription>Download data and structures</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-2">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground">
                  Export results in multiple formats (PDB, CSV, PDF)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="hero" size="lg" disabled>
              <Download className="mr-2 h-4 w-4" />
              Download Results
            </Button>
            <Button asChild variant="molecular" size="lg">
              <Link to="/job/new">
                Create New Job
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobResults;