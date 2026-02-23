import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Activity, Zap, TrendingUp, Target, Map, Clock, X } from 'lucide-react';
import { Badge } from './ui/badge';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('citysentinel-welcome-seen');
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('citysentinel-welcome-seen', 'true');
    setOpen(false);
  };

  const features = [
    {
      icon: Activity,
      title: 'Real-Time Dashboard',
      description: 'Monitor city health and risk levels with live WebSocket updates',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      icon: Zap,
      title: 'Scenario Simulator',
      description: 'Test policy changes and compare up to 5 scenarios side-by-side',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      title: '7-Day Forecasts',
      description: 'ML-powered predictions with confidence intervals',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Target,
      title: 'Policy Recommendations',
      description: 'AI-ranked strategies with cost and efficiency analysis',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: Map,
      title: 'Zone Risk Map',
      description: 'Geographic monitoring with evacuation priorities',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: Clock,
      title: 'Historical Trends',
      description: '7-day analysis with trend detection and pattern insights',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to CitySentinel AI</DialogTitle>
              <Badge variant="outline" className="mt-1 bg-green-500/20 text-green-400 border-green-500">
                Crisis Management Dashboard
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-slate-300 text-base">
            Your comprehensive platform for real-time city risk monitoring, policy simulation, and data-driven
            decision making during urban crises.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <h3 className="text-lg font-semibold text-white">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">💡 Getting Started</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Dashboard shows real-time city status and risk levels</li>
            <li>• Use the Simulator to test policy changes before implementation</li>
            <li>• Check Forecasts for ML-powered predictions</li>
            <li>• Review Recommendations for AI-ranked strategies</li>
            <li>• Monitor Zones for geographic risk distribution</li>
            <li>• Analyze History to identify patterns and trends</li>
          </ul>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🎨 Color Coding</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">CRITICAL - Immediate action required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-slate-300">HIGH - Urgent attention needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">MODERATE - Monitor closely</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">LOW/SAFE - Normal conditions</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            Get Started →
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
