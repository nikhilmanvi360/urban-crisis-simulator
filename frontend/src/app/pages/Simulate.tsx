import { useState, useEffect } from 'react';
import { simulate, compareScenarios } from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Zap, TrendingDown, Trophy, Plus, X, Droplets, TreePine, Car, Factory, ThermometerSun, ShieldCheck } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { PageHeader } from '../components/PageHeader';

interface SimulationResult {
  baseline: {
    risk_score: number;
    crisis_level: string;
    triggered_systems: string[];
    cascade_effects?: any;
    confidence_interval?: { lower: number; upper: number };
  };
  result: {
    risk_score: number;
    crisis_level: string;
    triggered_systems: string[];
    cascade_effects?: any;
    time_to_impact?: string | number;
    confidence_interval?: { lower: number; upper: number };
  };
  delta: {
    risk_reduction: number;
    percentage_improvement: string | number;
  };
  adjusted_data?: any;
}

interface Scenario {
  id: string;
  label: string;
  trafficReduction: number;
  industrialCut: number;
  heatwaveLevel: number;
  waterConservation: number;
  greenSpaceExpansion: number;
}

export function Simulate() {
  const [trafficReduction, setTrafficReduction] = useState(50);
  const [industrialCut, setIndustrialCut] = useState(50);
  const [heatwaveLevel, setHeatwaveLevel] = useState(2);
  const [waterConservation, setWaterConservation] = useState(30);
  const [greenSpaceExpansion, setGreenSpaceExpansion] = useState(20);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      label: 'Eco-Balanced Plan',
      trafficReduction: 40,
      industrialCut: 30,
      heatwaveLevel: 2,
      waterConservation: 50,
      greenSpaceExpansion: 40
    },
  ]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await simulate({
        trafficReduction,
        industrialCut,
        heatwaveLevel,
        waterConservation,
        greenSpaceExpansion,
      } as any);
      setResult(data);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setComparingLoading(true);
    try {
      const data = await compareScenarios(scenarios);
      setComparisonResult(data);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setComparingLoading(false);
    }
  };

  const addScenario = () => {
    if (scenarios.length < 5) {
      setScenarios([
        ...scenarios,
        {
          id: Date.now().toString(),
          label: `Scenario ${scenarios.length + 1}`,
          trafficReduction: 50,
          industrialCut: 50,
          heatwaveLevel: 2,
          waterConservation: 30,
          greenSpaceExpansion: 20,
        },
      ]);
    }
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((s) => s.id !== id));
    }
  };

  const updateScenario = (id: string, field: string, value: any) => {
    setScenarios(
      scenarios.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const getCrisisColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'HIGH':
        return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
      case 'MODERATE':
        return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
      case 'LOW':
        return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      default:
        return 'bg-slate-500';
    }
  };

  const getRiskGradient = (score: number) => {
    if (score > 0.75) return 'from-red-500 to-red-900';
    if (score > 0.55) return 'from-orange-500 to-orange-900';
    if (score > 0.3) return 'from-yellow-500 to-yellow-900';
    return 'from-emerald-500 to-emerald-900';
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Crisis Control & Policy Simulator"
          subtitle="Test high-impact urban policies and simulate ecological restoration outcomes in real-time."
          icon={Zap}
        />

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="bg-slate-950 border border-slate-800 p-1 rounded-xl mb-8">
            <TabsTrigger
              value="single"
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 transition-all font-bold"
            >
              Rapid Simulation
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 transition-all font-bold"
            >
              Multi-Scenario Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Policy Controls Panel */}
              <Card className="xl:col-span-5 bg-slate-900/50 backdrop-blur-xl border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-24 h-24 text-emerald-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Policy Parameter Injection
                </h3>

                <div className="space-y-10">
                  {/* Traffic Control */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Car className="w-4 h-4 text-blue-400" /></div>
                        <label className="text-sm font-bold text-slate-200 tracking-wide uppercase">Traffic Volume Reduction</label>
                      </div>
                      <span className="text-lg font-mono font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-md">{trafficReduction}%</span>
                    </div>
                    <Slider
                      value={[trafficReduction]}
                      onValueChange={(value) => setTrafficReduction(value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Mitigates urban mobility emissions and noise pollution factors.</p>
                  </div>

                  {/* Industrial Emissions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Factory className="w-4 h-4 text-purple-400" /></div>
                        <label className="text-sm font-bold text-slate-200 tracking-wide uppercase">Industrial Emission Cutting</label>
                      </div>
                      <span className="text-lg font-mono font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-md">{industrialCut}%</span>
                    </div>
                    <Slider
                      value={[industrialCut]}
                      onValueChange={(value) => setIndustrialCut(value[0])}
                      max={100}
                      step={1}
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Aggressive mandates for large-scale production facilities and energy sectors.</p>
                  </div>

                  {/* Water Conservation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg"><Droplets className="w-4 h-4 text-cyan-400" /></div>
                        <label className="text-sm font-bold text-slate-200 tracking-wide uppercase">Water Conservation Protocol</label>
                      </div>
                      <span className="text-lg font-mono font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-md">{waterConservation}%</span>
                    </div>
                    <Slider
                      value={[waterConservation]}
                      onValueChange={(value) => setWaterConservation(value[0])}
                      max={100}
                      step={1}
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Improves groundwater reservoir levels and reduces aquatic stress indices.</p>
                  </div>

                  {/* Green Space */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><TreePine className="w-4 h-4 text-emerald-400" /></div>
                        <label className="text-sm font-bold text-slate-200 tracking-wide uppercase">Urban Greenery Expansion</label>
                      </div>
                      <span className="text-lg font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-md">{greenSpaceExpansion}%</span>
                    </div>
                    <Slider
                      value={[greenSpaceExpansion]}
                      onValueChange={(value) => setGreenSpaceExpansion(value[0])}
                      max={100}
                      step={1}
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Deploys rapid vegetation corridors and carbon-sink infrastructure.</p>
                  </div>

                  {/* External Factor: Heatwave */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg"><ThermometerSun className="w-4 h-4 text-orange-400" /></div>
                        <label className="text-sm font-bold text-slate-200 tracking-wide uppercase">Heatwave Severity Scenario</label>
                      </div>
                      <span className="text-lg font-mono font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-md">Lvl {heatwaveLevel}</span>
                    </div>
                    <Slider
                      value={[heatwaveLevel]}
                      onValueChange={(value) => setHeatwaveLevel(value[0])}
                      max={5}
                      step={1}
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Simulates extreme environmental stressors beyond direct state control.</p>
                  </div>
                </div>

                <Button
                  onClick={runSimulation}
                  disabled={loading}
                  className="w-full mt-12 h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-4 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                      COMPUTING CASCADE...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6 fill-current" />
                      GENERATE IMPACT SIMULATION
                    </div>
                  )}
                </Button>
              </Card>

              {/* Simulation Result Panel */}
              <div className="xl:col-span-7 space-y-6">
                {!result ? (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                      <Zap className="w-10 h-10 text-slate-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-400 mb-2">Simulation Ready</h4>
                    <p className="text-slate-500 max-w-md">Configure your policy parameters and execute the simulation engine to visualize the projected urban resilience outcome.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Baseline Status */}
                      <Card className="bg-slate-900 border-slate-800 p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <TrendingDown className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Current Baseline (No Action)</h4>
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-end gap-2 mb-2">
                              <span className="text-5xl font-black text-white">{(result.baseline.risk_score * 100).toFixed(0)}</span>
                              <span className="text-2xl font-bold text-slate-600 pb-1.5">%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getRiskGradient(result.baseline.risk_score)} transition-all duration-1000`}
                                style={{ width: `${result.baseline.risk_score * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Alert Level:</span>
                            <Badge className={`${getCrisisColor(result.baseline.crisis_level)} border-0 text-slate-950 font-black px-3 py-1 text-[10px]`}>
                              {result.baseline.crisis_level}
                            </Badge>
                          </div>

                          <div className="pt-4 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Triggered Response Systems:</span>
                            <div className="flex flex-wrap gap-2">
                              {result.baseline.triggered_systems.map(sys => (
                                <Badge key={sys} variant="outline" className="bg-slate-950/50 border-slate-700 text-slate-300 text-[10px] py-1">
                                  {sys.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Projected Result */}
                      <Card className="bg-slate-900 border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden group border-2">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Trophy className="w-24 h-24 text-emerald-500" />
                        </div>
                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6">Projected Restoration Goal</h4>
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-end gap-2 mb-2">
                              <span className="text-5xl font-black text-emerald-400">{(result.result.risk_score * 100).toFixed(0)}</span>
                              <span className="text-2xl font-bold text-emerald-900/60 pb-1.5">%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-1000"
                                style={{ width: `${result.result.risk_score * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Alert Level:</span>
                            <Badge className={`${getCrisisColor(result.result.crisis_level)} border-0 text-slate-950 font-black px-3 py-1 text-[10px]`}>
                              {result.result.crisis_level}
                            </Badge>
                            {result.result.confidence_interval && (
                              <Badge variant="outline" className="border-emerald-500/20 text-emerald-500/60 text-[9px] font-mono">
                                ±{((result.result.confidence_interval.upper - result.result.risk_score) * 100).toFixed(1)}% CONFIDENCE
                              </Badge>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-800">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Projected State Improvement:</span>
                            <div className="flex items-center gap-4">
                              <div className="text-3xl font-black text-emerald-400">-{result.delta.percentage_improvement}%</div>
                              <div className="flex-1 text-[10px] leading-relaxed text-slate-400 font-medium">
                                Significant reduction in cascading risk. Critical infrastructure stability increased by approximately {result.delta.percentage_improvement}%.
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Impact Breakdown */}
                    <Card className="bg-slate-950 border-slate-800 p-8 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 shadow-[0_0_15px_#10b981]"></div>
                      <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        Cross-Sector Delta Analysis
                      </h4>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Air Quality (AQI)</p>
                          <p className="text-2xl font-black text-white">{result.adjusted_data?.aqi.toFixed(0)}</p>
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[10px] mt-1 bg-emerald-500/5"> IMPROVED </Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Water Stress</p>
                          <p className="text-2xl font-black text-white">{result.result.cascade_effects?.water_risk != null ? (result.result.cascade_effects.water_risk * 100).toFixed(1) : (result.result.cascade_effects?.water_stress * 100).toFixed(1)}%</p>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 text-[10px] mt-1 bg-cyan-500/5"> MITIGATED </Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Time-to-Impact</p>
                          <p className="text-2xl font-black text-white">+{result.result.time_to_impact || '1.4'}x</p>
                          <p className="text-[10px] text-emerald-500/80 font-bold mt-1">RESPONSE WINDOW GAIN</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Crises Averted</p>
                          <p className="text-2xl font-black text-emerald-400">{(Number(result.delta.percentage_improvement) / 10).toFixed(0)}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">CRITICAL THRESHOLDS</p>
                        </div>
                      </div>
                    </Card>

                    {/* Crises Averted Card */}
                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-6">
                      <ShieldCheck className="w-12 h-12 text-emerald-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-emerald-400 uppercase text-sm mb-1 underline decoration-emerald-500/30 underline-offset-4">Ecological Restoration Summary</h5>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          The proposed policy combination results in a <span className="text-emerald-400 font-bold">{result.delta.percentage_improvement}% improvement</span> in city-wide risk.
                          Key averted events include <span className="text-white font-bold">Health System Overflow</span> and <span className="text-white font-bold">Critical Industrial Smog</span>.
                          Total time gained for emergency mobilization: <span className="text-emerald-400 font-bold">~14 days</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6 mt-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="bg-slate-900 border-slate-800 p-6 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
                  <div className="flex items-center justify-between mb-6">
                    <Input
                      value={scenario.label}
                      onChange={(e) => updateScenario(scenario.id, 'label', e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white font-bold tracking-tight focus:ring-emerald-500"
                    />
                    {scenarios.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScenario(scenario.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                        <span>Traffic</span>
                        <span className="text-blue-400">{scenario.trafficReduction}%</span>
                      </div>
                      <Slider
                        value={[scenario.trafficReduction]}
                        onValueChange={(value) => updateScenario(scenario.id, 'trafficReduction', value[0])}
                        max={100}
                        step={1}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                        <span>Industry</span>
                        <span className="text-purple-400">{scenario.industrialCut}%</span>
                      </div>
                      <Slider
                        value={[scenario.industrialCut]}
                        onValueChange={(value) => updateScenario(scenario.id, 'industrialCut', value[0])}
                        max={100}
                        step={1}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                        <span>Water</span>
                        <span className="text-cyan-400">{scenario.waterConservation}%</span>
                      </div>
                      <Slider
                        value={[scenario.waterConservation]}
                        onValueChange={(value) => updateScenario(scenario.id, 'waterConservation', value[0])}
                        max={100}
                        step={1}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                        <span>Greenery</span>
                        <span className="text-emerald-400">{scenario.greenSpaceExpansion}%</span>
                      </div>
                      <Slider
                        value={[scenario.greenSpaceExpansion]}
                        onValueChange={(value) => updateScenario(scenario.id, 'greenSpaceExpansion', value[0])}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-400 uppercase">
                      <ThermometerSun className="w-3 h-3 text-orange-400" />
                      Heatwave Lvl: {scenario.heatwaveLevel}
                    </div>
                    <Slider
                      value={[scenario.heatwaveLevel]}
                      onValueChange={(value) => updateScenario(scenario.id, 'heatwaveLevel', value[0])}
                      max={5}
                      step={1}
                      className="w-24"
                    />
                  </div>
                </Card>
              ))}

              {scenarios.length < 5 && (
                <button
                  onClick={addScenario}
                  className="group h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-500" />
                  </div>
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-widest group-hover:text-emerald-500">Append Scenario ({scenarios.length}/5)</span>
                </button>
              )}
            </div>

            <Button
              onClick={runComparison}
              disabled={comparingLoading}
              className="w-full h-16 bg-slate-100 hover:bg-white text-slate-950 font-black text-xl rounded-2xl shadow-xl transition-all"
            >
              {comparingLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-950 rounded-full animate-spin"></div>
                  COMPARING ECOLOGICAL FUTURES...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 fill-current" />
                  RUN CROSS-SCENARIO STRESS TEST
                </div>
              )}
            </Button>

            {comparisonResult && (
              <Card className="bg-slate-950 border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-700">
                <h3 className="text-2xl font-black text-white mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Optimal Strategy Ranking
                </h3>
                <div className="space-y-4">
                  {comparisonResult.comparison.map((row: any, index: number) => (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl transition-all ${index === 0
                        ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                        : 'bg-slate-900/40 border border-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                            }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-black text-xl text-white tracking-tight">{row.label}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={`${getCrisisColor(row.crisis_level)} border-0 text-slate-950 font-black text-[9px] px-2`}>
                                {row.crisis_level}
                              </Badge>
                              {index === 0 && <Badge className="bg-yellow-500 text-slate-950 font-black text-[9px]">RECOMMENDED</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-end justify-end gap-1 mb-1">
                            <span className="text-3xl font-black text-white">{(row.risk_score * 100).toFixed(0)}</span>
                            <span className="text-base font-bold text-slate-600 pb-1">%</span>
                          </div>
                          <p className="text-xs font-bold text-emerald-400 uppercase">↓ {row.percentage_improvement}% REDUCTION</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
