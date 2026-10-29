import React, { useState } from "react";
import { 
  PackagePlus, 
  Search, 
  CheckCircle2, 
  Calendar, 
  User, 
  MapPin, 
  Truck, 
  Printer
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

  // Form State
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

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="aww-card rounded-2xl p-6 bg-white border border-neutral-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="aww-tag text-[10px] text-neutral-500 font-bold">
              LEDGER // 01 · INVENTORY
            </span>
          </div>
          <h2 className="text-2xl font-black text-black font-heading tracking-tight">
            PRODUCE INVENTORY & BATCH LEDGER
          </h2>
          <p className="text-xs text-neutral-600 mt-1 max-w-xl font-mono">
            Direct farmer intake traceability, warehouse rack coordinates, weight records, and tariff accruals.
          </p>

          {/* Chamber Breakdown Pills */}
          <div className="flex flex-wrap gap-2 mt-4 font-mono">
            {chambers.map(ch => {
              const pct = Math.round((ch.usedMT / ch.capacityMT) * 100);
              return (
                <div 
                  key={ch.id} 
                  className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs flex items-center gap-2.5"
                >
                  <span className="font-bold text-black">{ch.id}</span>
                  <span className="text-neutral-600">{ch.usedMT}/{ch.capacityMT} MT</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    pct > 85 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer hover:scale-[1.02] font-mono"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ REGISTER NEW INTAKE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farmer, lot number, or crop..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-neutral-300 text-black placeholder-neutral-400 focus:border-black outline-none font-mono shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto font-mono">
          <select
            value={chamberFilter}
            onChange={e => setChamberFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 text-neutral-800 focus:border-black outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">All Chambers</option>
            {chambers.map(c => (
              <option key={c.id} value={c.id}>{c.id} ({c.cropType.split(" ")[0]})</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white border border-neutral-300 text-neutral-800 focus:border-black outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">All Status</option>
            <option value="Stored">Active Stored</option>
            <option value="Dispatched">Dispatched</option>
          </select>

          <span className="text-xs text-neutral-600 whitespace-nowrap ml-2">
            <strong className="text-black">{filteredItems.length}</strong> BATCHES
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="aww-card rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100/90 border-b border-neutral-200 text-neutral-600 font-mono text-[10px] tracking-wider uppercase font-bold">
                <th className="py-3.5 px-5">LOT // PRODUCER</th>
                <th className="py-3.5 px-5">CROP TYPE</th>
                <th className="py-3.5 px-5">VAULT / BAY</th>
                <th className="py-3.5 px-5">WEIGHT</th>
                <th className="py-3.5 px-5">INTAKE DATE</th>
                <th className="py-3.5 px-5">GRADE</th>
                <th className="py-3.5 px-5">TARIFF ACCRUED</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {filteredItems.map(item => {
                const daysInStorage = Math.max(1, Math.round((Date.now() - new Date(item.intakeDate).getTime()) / (1000 * 60 * 60 * 24)));
                const estimatedFee = item.storageCostAccrued || Math.round(daysInStorage * item.quantityMT * item.dailyRatePerMT * 100) / 100;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-black text-xs">{item.lotNumber}</div>
                      <div className="text-neutral-700 flex items-center gap-1.5 mt-0.5 text-[11px] font-sans">
                        <User className="w-3 h-3 text-neutral-400" /> {item.farmerName}
                      </div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400" /> {item.farmerLocation}
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-black">{item.cropName}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">ID: {item.cropId}</div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-black text-[10px]">
                          {item.chamberId}
                        </span>
                        <span className="text-neutral-600 text-[10px]">
                          {item.rackLocation}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-black text-sm">
                        {item.quantityMT} <span className="text-[10px] text-neutral-500 font-normal">MT</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {(item.cratesCount ?? 0).toLocaleString()} crates
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="text-neutral-800 flex items-center gap-1 font-sans">
                        <Calendar className="w-3 h-3 text-neutral-400" /> {item.intakeDate}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {daysInStorage} days stored
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-200 bg-neutral-100 text-neutral-800">
                        {item.qualityGrade}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-black text-sm">
                        ${estimatedFee.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-neutral-400">
                        ${item.dailyRatePerMT}/MT/day
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      {item.status === "Stored" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> STORED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-neutral-200 bg-neutral-100 text-neutral-600 flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-neutral-400" /> DISPATCHED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {item.status === "Stored" ? (
                        <button
                          onClick={() => setDispatchItem(item)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 bg-white hover:bg-black hover:text-white text-black transition-all cursor-pointer shadow-2xs"
                        >
                          DISPATCH
                        </button>
                      ) : (
                        <button
                          onClick={() => setDispatchItem(item)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-black cursor-pointer"
                        >
                          RECEIPT
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

      {/* Check-In Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="aww-card max-w-xl w-full rounded-2xl p-7 bg-white border border-neutral-300 shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
              <div>
                <h3 className="text-lg font-bold text-black font-heading">
                  PRODUCE CHECK-IN MANIFEST
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Allocate chamber storage bay and register official farmer intake.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">PRODUCER / FARMER NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Orchards"
                    value={formData.farmerName}
                    onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={formData.farmerPhone}
                    onChange={e => setFormData({ ...formData, farmerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">DISTRICT / LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Shimla, HP"
                    value={formData.farmerLocation}
                    onChange={e => setFormData({ ...formData, farmerLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">CROP CULTIVAR</label>
                  <select
                    value={formData.cropId}
                    onChange={e => handleCropChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black cursor-pointer"
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">ASSIGNED VAULT</label>
                  <select
                    value={formData.chamberId}
                    onChange={e => setFormData({ ...formData, chamberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black cursor-pointer"
                  >
                    {chambers.map(c => (
                      <option key={c.id} value={c.id}>{c.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">STORAGE BAY</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">GRADE</label>
                  <select
                    value={formData.qualityGrade}
                    onChange={e => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black cursor-pointer"
                  >
                    <option value="Grade A+">Grade A+ (Export)</option>
                    <option value="Grade A">Grade A (Standard)</option>
                    <option value="Grade B">Grade B (Processing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">QUANTITY (MT)</label>
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
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">CRATES COUNT</label>
                  <input
                    type="number"
                    value={formData.cratesCount}
                    onChange={e => setFormData({ ...formData, cratesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-600 font-bold block mb-1">RATE ($/MT/DAY)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dailyRatePerMT}
                    onChange={e => setFormData({ ...formData, dailyRatePerMT: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-300 text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:text-black cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-black text-white font-bold hover:bg-neutral-800 cursor-pointer shadow-md"
                >
                  CONFIRM INTAKE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal / Receipt */}
      {dispatchItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="aww-card max-w-lg w-full rounded-2xl p-6 bg-white border border-neutral-300 shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-black" />
                <h3 className="text-base font-bold text-black font-heading">
                  {dispatchItem.status === "Stored" ? "GATE PASS & DISPATCH CHECKOUT" : "DISPATCH BILLING RECEIPT"}
                </h3>
              </div>
              <button
                onClick={() => setDispatchItem(null)}
                className="text-neutral-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">BATCH LOT:</span>
                  <span className="font-bold text-black">{dispatchItem.lotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">FARMER:</span>
                  <span className="text-black font-medium">{dispatchItem.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">CROP:</span>
                  <span className="text-black">{dispatchItem.cropName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">LOCATION:</span>
                  <span className="text-black">{dispatchItem.chamberId} (Bay {dispatchItem.rackLocation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">QUANTITY:</span>
                  <span className="text-black font-bold">{dispatchItem.quantityMT} MT ({dispatchItem.cratesCount} crates)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>TARIFF RATE:</span>
                  <span className="text-black font-bold">${dispatchItem.dailyRatePerMT}/MT/day</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>STORAGE DAYS:</span>
                  <span className="text-black font-bold">
                    {dispatchItem.storageDaysTotal || Math.max(1, Math.round((Date.now() - new Date(dispatchItem.intakeDate).getTime()) / 86400000))} days
                  </span>
                </div>
                <div className="flex justify-between text-black font-bold text-sm pt-2 border-t border-neutral-200">
                  <span>TOTAL PAYABLE:</span>
                  <span className="text-emerald-700 text-base font-black">
                    ${(dispatchItem.finalBillAmount || dispatchItem.storageCostAccrued || 1200).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDispatchItem(null)}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:text-black cursor-pointer font-bold"
              >
                CLOSE
              </button>
              {dispatchItem.status === "Stored" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await onDispatchInventory(dispatchItem.id);
                    setDispatchItem(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  APPROVE DISPATCH & VACATE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-black text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> PRINT PASS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
