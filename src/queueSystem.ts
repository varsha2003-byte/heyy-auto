import { supabase } from "./supabaseClient";

// 📌 Function: Fetch Driver's Queue Position
export const fetchQueuePosition = async (driverId, autoStandId) => {
    if (!driverId || !autoStandId) return null;

    const { data: queue, error } = await supabase
        .from("driver_queue")
        .select("driver_id")
        .eq("auto_stand_id", autoStandId)
        .order("position", { ascending: true });

    if (error || !queue) return null;

    const position = queue.findIndex((entry) => entry.driver_id === driverId);
    return position !== -1 ? position + 1 : null;
};

// 📌 Function: Driver Joins Queue
export const joinQueue = async (driverId) => {
    if (!driverId) return { error: "Invalid driver ID" };

    // Fetch the auto stand ID for this driver
    const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("auto_stand_id")
        .eq("id", driverId)
        .single();

    if (driverError || !driverData) {
        return { error: "Driver not found or not assigned to a stand" };
    }

    const autoStandId = driverData.auto_stand_id;

    // Check if driver is already in queue
    const { data: existingDriver, error: checkError } = await supabase
        .from("driver_queue")
        .select("position")
        .eq("driver_id", driverId)
        .eq("auto_stand_id", autoStandId)
        .single();

    if (existingDriver) {
        return { position: existingDriver.position }; // Driver already in queue
    }

    // Find the last position in the queue for this stand
    const { data: lastInQueue, error: queueError } = await supabase
        .from("driver_queue")
        .select("position")
        .eq("auto_stand_id", autoStandId)
        .order("position", { ascending: false })
        .limit(1);

    const newPosition = lastInQueue?.length ? lastInQueue[0].position + 1 : 1;

    // Insert driver into queue with new position
    const { error: insertError } = await supabase.from("driver_queue").insert([{
        driver_id: driverId,
        auto_stand_id: autoStandId,
        position: newPosition,
        joined_at: new Date(),
    }]);

    if (insertError) return { error: insertError.message };

    return { position: newPosition };
};

// 📌 Function: Driver Leaves Queue (Reorders queue)
export const leaveQueue = async (driverId, autoStandId) => {
    if (!driverId || !autoStandId) return { error: "Invalid data" };

    // Get the position of the driver leaving
    const { data: driverData, error: fetchError } = await supabase
        .from("driver_queue")
        .select("position")
        .eq("driver_id", driverId)
        .eq("auto_stand_id", autoStandId)
        .single();

    if (fetchError || !driverData) return { error: "Driver not found in queue" };

    const leavingPosition = driverData.position;

    // Remove the driver from the queue
    const { error: deleteError } = await supabase
        .from("driver_queue")
        .delete()
        .eq("driver_id", driverId)
        .eq("auto_stand_id", autoStandId);

    if (deleteError) return { error: deleteError.message };

    // Update positions of drivers below the leaving driver
    const { error: updateError } = await supabase
        .from("driver_queue")
        .update({ position: supabase.raw("position - 1") })
        .eq("auto_stand_id", autoStandId)
        .gt("position", leavingPosition);

    if (updateError) return { error: updateError.message };

    return { success: true };
};

// 📌 Function: Assign Driver from Queue (FIFO)
export const assignDriverFromQueue = async (standId) => {
    const { data: nextDriver, error } = await supabase
        .from("driver_queue")
        .select("driver_id, position")
        .eq("auto_stand_id", standId)
        .order("position", { ascending: true }) // FIFO: Get the first driver
        .limit(1)
        .single();

    if (error || !nextDriver) {
        console.log("No drivers in queue.");
        return null;
    }

    const driverId = nextDriver.driver_id;

    // Remove assigned driver and reorder queue
    await leaveQueue(driverId, standId);

    return driverId;
};
