#include "Measurement.h"

#include <fstream>
#include <string>
#include <math.h>

Measurement::Measurement(double eta, int N)
    : v_av(0), count(0), m_N(N), m_eta(eta)
{
	OUTFILE = std::string("data/av_velocity_eta=") + std::to_string(m_eta) + std::string(".txt");
    binOut.open(OUTFILE, std::ios_base::app);
}

Measurement::~Measurement()
{
	binOut.close();
}

void Measurement::Measure(State &state)
{
	double vx_av = 0;
    double vy_av = 0;
    for(int i=0; i<m_N; i++)
    {
        vx_av += state.v*cos(state.theta[i]);
        vy_av += state.v*sin(state.theta[i]);
    }
	v_av += sqrt(vx_av*vx_av + vy_av*vy_av);
	count++;
	if(!(count % binSize)){Out();}
}

void Measurement::Out()
{
	v_av /= (m_N*binSize);

	std::vector<double> out;
	out.push_back(v_av);  

	while(!out.empty()){binOut << out.back() << ','; out.pop_back();}  
    binOut << '\n';

	v_av = 0;
	count = 0;
}