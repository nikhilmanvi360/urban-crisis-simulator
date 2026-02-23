import { useEffect, useState } from 'react';
import { getRecommendations } from '../api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Target, TrendingDown, DollarSign, Trophy, Lightbulb } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { PageHeader } from '../components/PageHeader';
import { useCity } from '../context/CityContext';

interface Strategy {
  label: string;
  description: string;
  projected_risk: number;
  improvement_pct: number;
  efficiency_score: number;
  cost: string;
}

interface RecommendationsData {
  baseline_risk: number;
  strategies: Strategy[];
}

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const { city } = useCity();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations(city.id);
  }, [city.id]);

  const loadRecommendations = async (cityId: string) => {
    try {
      const data = await getRecommendations(cityId);
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !recommendations) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500';
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Policy Recommendations"
          subtitle="AI-ranked strategies for crisis mitigation"
          icon={Lightbulb}
        />

        <Card className="bg-card border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Baseline Risk</p>
              <p className="text-4xl font-bold text-red-500 mt-2">{((recommendations?.baseline_risk ?? 0) * 100).toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Strategies</p>
              <p className="text-4xl font-bold text-card-foreground mt-2">{recommendations?.strategies?.length ?? 0}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {(recommendations?.strategies || []).map((strategy, index) => (
            <Card
              key={index}
              className={`bg-card border-border p-6 shadow-sm ${index === 0 ? 'border-2 border-yellow-500/50' : ''
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${index === 0
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : index === 1
                        ? 'bg-muted text-muted-foreground'
                        : index === 2
                          ? 'bg-orange-500/10 text-orange-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {index === 0 && <Trophy className="w-6 h-6" />}
                    {index !== 0 && `#${index + 1}`}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">{strategy.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{strategy.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getCostColor(strategy.cost)}>
                  {strategy.cost} Cost
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
                    <Target className="w-3 h-3" />
                    Projected Risk
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">{(strategy.projected_risk * 100).toFixed(0)}%</p>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
                    <TrendingDown className="w-3 h-3" />
                    Improvement
                  </div>
                  <p className="text-2xl font-bold text-green-600">{strategy.improvement_pct.toFixed(1)}%</p>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
                    <Trophy className="w-3 h-3" />
                    Efficiency
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{(strategy.efficiency_score * 100).toFixed(0)}</p>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
                    <DollarSign className="w-3 h-3" />
                    ROI Rating
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded ${i < strategy.efficiency_score * 5 ? 'bg-green-500' : 'bg-slate-700'
                          }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {index === 0 && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-600 font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    RECOMMENDED: Highest efficiency score with optimal balance of impact and cost
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rust"></div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Strategy Implementation Note</h3>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            All strategies can be combined for maximum effect. The efficiency score represents the cost-benefit ratio
            where higher scores indicate better returns on investment. Consider implementing multiple strategies
            simultaneously for compounding benefits.
          </p>
        </Card>
      </div>
    </PageTransition>
  );
}
