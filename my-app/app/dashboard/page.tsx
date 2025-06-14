'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ExamCenter {
  id: number;
  name: string;
  address: string;
  total_submissions: number;
  graded_submissions: number;
  reviewed_submissions: number;
  average_score: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  total_submissions: number;
  graded_submissions: number;
  reviewed_submissions: number;
  average_score: number;
}

interface OverviewStats {
  total_submissions: number;
  graded_submissions: number;
  reviewed_submissions: number;
  average_score: number;
  total_schools: number;
  total_subjects: number;
}

export default function DashboardPage() {
  const [examCenters, setExamCenters] = useState<ExamCenter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersRes, subjectsRes, overviewRes] = await Promise.all([
          fetch('/api/statistics/exam-centers', { credentials: 'include' }),
          fetch('/api/statistics/subjects', { credentials: 'include' }),
          fetch('/api/statistics/overview', { credentials: 'include' })
        ]);

        if (!centersRes.ok || !subjectsRes.ok || !overviewRes.ok) {
          throw new Error('Eroare la încărcarea datelor');
        }

        const [centers, subjects, overview] = await Promise.all([
          centersRes.json(),
          subjectsRes.json(),
          overviewRes.json()
        ]);

        setExamCenters(centers);
        setSubjects(subjects);
        setOverview(overview);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea datelor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Lucrări</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.total_submissions || 0}</div>
            <div className="text-sm text-gray-500 mt-2">
              {overview?.graded_submissions || 0} corectate, {overview?.reviewed_submissions || 0} verificate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medie Generală</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.average_score?.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-500 mt-2">puncte</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Centre de Examen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.total_schools || 0}</div>
            <div className="text-sm text-gray-500 mt-2">centre active</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="centers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="centers">Centre de Examen</TabsTrigger>
          <TabsTrigger value="subjects">Materii</TabsTrigger>
        </TabsList>

        <TabsContent value="centers">
          <Card>
            <CardHeader>
              <CardTitle>Centre de Examen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nume Centru</TableHead>
                    <TableHead>Adresă</TableHead>
                    <TableHead>Total Lucrări</TableHead>
                    <TableHead>Corectate</TableHead>
                    <TableHead>Verificate</TableHead>
                    <TableHead>Medie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{center.address}</TableCell>
                      <TableCell>{center.total_submissions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {center.graded_submissions}
                          <Progress 
                            value={(center.graded_submissions / center.total_submissions) * 100} 
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {center.reviewed_submissions}
                          <Progress 
                            value={(center.reviewed_submissions / center.total_submissions) * 100} 
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{center.average_score?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Materii</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materie</TableHead>
                    <TableHead>Cod</TableHead>
                    <TableHead>Total Lucrări</TableHead>
                    <TableHead>Corectate</TableHead>
                    <TableHead>Verificate</TableHead>
                    <TableHead>Medie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.total_submissions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {subject.graded_submissions}
                          <Progress 
                            value={(subject.graded_submissions / subject.total_submissions) * 100} 
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {subject.reviewed_submissions}
                          <Progress 
                            value={(subject.reviewed_submissions / subject.total_submissions) * 100} 
                            className="w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{subject.average_score?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
