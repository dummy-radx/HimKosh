import React, { useState } from "react";
import { 
  PackagePlus, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Printer, 
  BadgeAlert,
  ArrowRight
} from "lucide-react";
import { InventoryItem, Chamber, CropGuideline } from "../types";

interface InventoryTabProps {
  inventory: InventoryItem[];
  chambers: Chamber[];
  crops: CropGuideline[];
  onAddInventory: (item: Partial<InventoryItem>) => Promise<void>;
  onDispatchInventory: (id: string) => Promise<void>;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  chambers,
  crops,
  onAddInventory,
  onDispatchInventory
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<InventoryItem | null>(null);

  // Form State for New Intake
  const [formData, setFormData] = useState({
    farmerName: "",
    farmerPhone: "",
    farmerLocation: "",
    cropId: crops[0]?.id || "apples",
    chamberId: "CH-1",
    rackLocation: "R1-D",
    quantityMT: 20,
    cratesCount: 1000,
    intakeDate: new Date().toISOString().split("T")[0],
    expectedExitDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
    qualityGrade: "Grade A",
    dailyRatePerMT: 2.5
  });

  const handleCropChange = (cropId: string) => {
    const selectedCrop = crops.find(c => c.id === cropId);
    if (selectedCrop) {
      setFormData(prev => ({
        ...prev,
        cropId,
        chamberId: selectedCrop.recommendedChamber || prev.chamberId,
        dailyRatePerMT: selectedCrop.storageFeePerTonPerDay || prev.dailyRatePerMT
      }));
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCrop = crops.find(c => c.id === formData.cropId);
    await onAddInventory({
      ...formData,
      cropName: selectedCrop?.name || formData.cropId,
      quantityMT: Number(formData.quantityMT),
      cratesCount: Number(formData.cratesCount),
      dailyRatePerMT: Number(formData.dailyRatePerMT)
    });
    setShowAddModal(false);
    // Reset form
    setFormData({
      farmerName: "",
      farmerPhone: "",
      farmerLocation: "",
      cropId: crops[0]?.id || "apples",
      chamberId: "CH-1",
      rackLocation: "R1-D",
      quantityMT: 20,
      cratesCount: 1000,
      intakeDate: new Date().toISOString().split("T")[0],
      expectedExitDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
      qualityGrade: "Grade A",
      dailyRatePerMT: 2.5
    });
  };

  // Filtered List
  const filteredItems = inventory.filter(item => {
    const matchesSearch = 
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chamberId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesChamber = chamberFilter === "ALL" || item.chamberId === chamberFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesChamber && matchesStatus;
  });

  // Capacity breakdown across chambers
  const totalCapacity = chambers.reduce((acc, c) => acc + c.capacityMT, 0);
  const totalUsed = chambers.reduce((acc, c) => acc + c.usedMT, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Storage Capacity & Quick Check-in Button */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">
            Agro-Produce Inventory & Pallet Tracking
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time batch traceability by farmer, crop cultivar, chamber bay, weight, and accrual billing.
          </p>

          {/* Chamber Breakdown Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {chambers.map(ch => {
              const pct = Math.round((ch.usedMT / ch.capacityMT) * 100);
              return (
                <div 
                  key={ch.id} 
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2"
                >
                  <span className="font-mono text-cyan-400 font-bold">{ch.id}</span>
                  <span className="text-slate-300">{ch.usedMT} / {ch.capacityMT} MT</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    pct > 85 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Check-In New Produce</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farmer, lot #, or crop..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Chamber Filter */}
          <select
            value={chamberFilter}
            onChange={e => setChamberFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Chambers</option>
            {chambers.map(c => (
              <option key={c.id} value={c.id}>{c.id} ({c.cropType.split(" ")[0]})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Stored">Stored (Active)</option>
            <option value="Dispatched">Dispatched (Checked Out)</option>
          </select>

          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
            Showing <strong className="text-white">{filteredItems.length}</strong> lots
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Lot # & Farmer</th>
                <th className="py-3.5 px-4">Crop & Cultivar</th>
                <th className="py-3.5 px-4">Chamber / Bay</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Intake Date</th>
                <th className="py-3.5 px-4">Quality Grade</th>
                <th className="py-3.5 px-4">Storage Fee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map(item => {
                const daysInStorage = Math.max(1, Math.round((Date.now() - new Date(item.intakeDate).getTime()) / (1000 * 60 * 60 * 24)));
                const estimatedFee = item.storageCostAccrued || Math.round(daysInStorage * item.quantityMT * item.dailyRatePerMT * 100) / 100;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-cyan-400">{item.lotNumber}</div>
                      <div className="font-medium text-white flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-400" /> {item.farmerName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" /> {item.farmerLocation}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.cropName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        ID: {item.cropId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {item.chamberId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.rackLocation}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">
                        {item.quantityMT} <span className="text-xs font-normal text-slate-400">MT</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {item.cratesCount.toLocaleString()} crates
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {item.intakeDate}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {daysInStorage} days stored
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {item.qualityGrade}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-200">
                        ${estimatedFee.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ${item.dailyRatePerMT}/MT/day
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.status === "Stored" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Stored
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" /> Dispatched
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {item.status === "Stored" ? (
                        <button
                          onClick={() => setDispatchItem(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
                        >
                          Dispatch
                        </button>
                      ) : (
                        <button
                          onClick={() => setDispatchItem(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white cursor-pointer"
                        >
                          Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Produce Intake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-2xl p-6 border border-white/20 shadow-2xl relative animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    Check-In Farmer Produce Lot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Register intake, assign chamber rack, and initiate cold chain tracking.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Farmer / Producer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Orchards"
                    value={formData.farmerName}
                    onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Farmer Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={formData.farmerPhone}
                    onChange={e => setFormData({ ...formData, farmerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Farmer Location / District</label>
                  <input
                    type="text"
                    placeholder="e.g. Shimla, HP"
                    value={formData.farmerLocation}
                    onChange={e => setFormData({ ...formData, farmerLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Crop Cultivar</label>
                  <select
                    value={formData.cropId}
                    onChange={e => handleCropChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Chamber</label>
                  <select
                    value={formData.chamberId}
                    onChange={e => setFormData({ ...formData, chamberId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 cursor-pointer font-mono"
                  >
                    {chambers.map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.name.split("-")[1] || c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Storage Rack / Bay</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quality Grade</label>
                  <select
                    value={formData.qualityGrade}
                    onChange={e => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Grade A+">Grade A+ (Premium Export)</option>
                    <option value="Grade A">Grade A (Standard Market)</option>
                    <option value="Grade B">Grade B (Processing Grade)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity (MT)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={formData.quantityMT}
                    onChange={e => setFormData({
                      ...formData,
                      quantityMT: parseFloat(e.target.value) || 0,
                      cratesCount: Math.round((parseFloat(e.target.value) || 0) * 50)
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Crates / Boxes</label>
                  <input
                    type="number"
                    value={formData.cratesCount}
                    onChange={e => setFormData({ ...formData, cratesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fee Rate ($/MT/day)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dailyRatePerMT}
                    onChange={e => setFormData({ ...formData, dailyRatePerMT: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Intake Date</label>
                  <input
                    type="date"
                    value={formData.intakeDate}
                    onChange={e => setFormData({ ...formData, intakeDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Exit Date</label>
                  <input
                    type="date"
                    value={formData.expectedExitDate}
                    onChange={e => setFormData({ ...formData, expectedExitDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  Confirm Produce Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch / Checkout Modal & Receipt */}
      {dispatchItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-heading">
                  {dispatchItem.status === "Stored" ? "Dispatch & Checkout Lot" : "Official Dispatch Receipt"}
                </h3>
              </div>
              <button
                onClick={() => setDispatchItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lot Number:</span>
                  <span className="font-mono font-bold text-cyan-400">{dispatchItem.lotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Farmer:</span>
                  <span className="font-semibold text-white">{dispatchItem.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Crop:</span>
                  <span className="text-slate-200">{dispatchItem.cropName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Location:</span>
                  <span className="font-mono text-slate-200">{dispatchItem.chamberId} (Bay {dispatchItem.rackLocation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity Discharged:</span>
                  <span className="font-bold text-white">{dispatchItem.quantityMT} MT ({dispatchItem.cratesCount} crates)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intake Date:</span>
                  <span className="text-slate-200">{dispatchItem.intakeDate}</span>
                </div>
              </div>

              {/* Billing Computation */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
                <div className="text-xs font-semibold text-cyan-300 mb-1 flex items-center justify-between">
                  <span>Storage Billing Summary</span>
                  <span className="text-[10px] text-cyan-400">Rate: ${dispatchItem.dailyRatePerMT}/MT/day</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Days Stored:</span>
                  <span className="font-mono">
                    {dispatchItem.storageDaysTotal || Math.max(1, Math.round((Date.now() - new Date(dispatchItem.intakeDate).getTime()) / 86400000))} days
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cold Storage Tariff:</span>
                  <span className="font-mono">
                    ${(dispatchItem.quantityMT * dispatchItem.dailyRatePerMT).toFixed(2)} / day
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-cyan-800/60">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-400">
                    ${(dispatchItem.finalBillAmount || dispatchItem.storageCostAccrued || 1200).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDispatchItem(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
              {dispatchItem.status === "Stored" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await onDispatchInventory(dispatchItem.id);
                    setDispatchItem(null);
                  }}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Approve Dispatch & Free Space
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Gate Pass
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
