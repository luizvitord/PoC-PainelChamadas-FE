import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Stethoscope, Activity, Monitor } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">Hospital Emergency Room</h1>
          <p className="text-xl text-muted-foreground">Manchester Triage System</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <UserPlus className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Reception</CardTitle>
              <CardDescription>Register new patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/reception">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Stethoscope className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Triage</CardTitle>
              <CardDescription>Nurse triage station</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/triage">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Activity className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Doctor</CardTitle>
              <CardDescription>Consultation dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/doctor">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Monitor className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Public Panel</CardTitle>
              <CardDescription>TV display panel</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/panel">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
