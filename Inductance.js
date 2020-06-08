/* Inductor measuremet using the Digilent AnalogDiscovery2
 * created by FeldiM2425
 * 
 * The script measures the input and output voltage of an RL Voltage divider / Filter to determine the Inductance
 * Use the MConf object for settings (see comments for more info)
 * To setup the measurement open a Wavegen tab and a Scope tab ("Wavegen1" and "Scope1")
 *
 * Setup the following Circuit: 
 *
 *  Gen1 = Signal generator output (default: Ch1)
 *
 *  Gen1---+------- Uin (default: Scope Ch1)
 *         |
 *         _
 *        | | R1
 *        |_|
 *         |
 *         +------- Uout (default: Scope Ch2)
 *         |
 *        |#|
 *        |#| L1
 *        |#|
 *         |
 *         |
 *        --- (GND)
 */

var MConf = {
    frequency: 1000000, // Measurement frequency in Hz
    amplitude: 5,      // Amplitude of the Signal generator output in Volts

    genChOut: 1,  // Signal generator output Channel
    wavChUin: 1,  // Scope input channel for Uin (can be null; in that case the output amplitude will be used) 
    wavChUout: 2, // Scope input channel for Uout

    samples: 30,   // Number of samples to measure for averaging
    waittime: 100, // Delay between samples in milliseconds

    resistor: 10   // Resistance of R1 in ohm
}




if(!('Wavegen1' in this) || !('Scope1' in this)) throw "Please open a Scope and a Wavegen instrument";

// Check Scope State and Scope Channels
if(!Scope1.State.running()) throw "Please start the Scope";

var ScopeChannel_in = MConf.wavChUin==null ? null : Scope1.channel[MConf.wavChUin-1];
var ScopeChannel_out = Scope1.channel[MConf.wavChUout-1];

if(!ScopeChannel_out) throw "Invalid Channel for wavChUout";
if(!ScopeChannel_in && MConf.wavChUin) throw "Invalid Channel for wavChUin";

// Check Wavegen State and Wavegen Channels
if(typeof(MConf.genChOut) !== "number" || MConf.genChOut < 1) throw "Invalid Channel for wavChUout";

var WaveChannel = Wavegen1["Channel"+(MConf.genChOut)]
if(!WaveChannel) throw "Invalid Channel for genChOut";




WaveChannel.Mode.text = "Simple";
WaveChannel.Simple.Offset.value = 0;
WaveChannel.Simple.Type.text = "Sine";
WaveChannel.Simple.Symmetry.value = 50;
WaveChannel.Simple.Amplitude.value = MConf.amplitude;
WaveChannel.Simple.Frequency.value = MConf.frequency;


Wavegen1.run();
print("-- Start Measurement --");
wait(1);

var sampleSum_in=0;
var sampleSum_out=0;
for(var i = 0; i < MConf.samples; i++) {
    var mOut = ScopeChannel_out.measure("Maximum");
    var mIn = ScopeChannel_in==null ? MConf.amplitude : ScopeChannel_in.measure("Maximum"); 
    sampleSum_out += mOut;
    sampleSum_in += mIn;
    print("Sample #"+(i+1)+" -> Out: "+mOut+"V / In: "+mIn+"V");
    wait(MConf.waittime / 1000);
}
Wavegen1.stop();

print("-- End Measurement --");
sampleSum_in /= MConf.samples;
sampleSum_out /= MConf.samples;
print("Average -> Out: "+mOut+"V / In: "+mIn+"V");

var Xl = MConf.resistor / ( ( mIn / mOut ) -  1 );
var L = Xl / (2 * Math.PI * MConf.frequency);

print("Inductor: "+L+" H");

