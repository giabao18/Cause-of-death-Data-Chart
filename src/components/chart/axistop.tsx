interface IFormat {
  xScale: any;
  innerHeight: any;
  tickFormat: any;
}

export const AxisTop = ({ xScale, innerHeight, tickFormat }: IFormat) =>
  xScale.ticks().map((id: number, tickValue: any) => (
    <g
      key={id}
      className="tick"
      transform={`translate(${xScale(tickValue)},0) `}
    >
      <line y2={innerHeight} />
      <text
        key={tickValue}
        style={{ textAnchor: 'middle' }}
        dy="0.71em"
        y={innerHeight}
      >
        {tickFormat(tickValue * 1000)}
      </text>
    </g>
  ));
