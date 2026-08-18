import { memo, useState } from 'react';
import { ChevronDown, TableProperties } from 'lucide-react';
import Math from './Math.jsx';

function FormulaReference({ title, groups }) {
  const [open, setOpen] = useState(true);
  const count = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <section className={`reference ${open ? 'is-open' : ''}`} aria-labelledby="reference-heading">
      <button
        className="reference-head"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <TableProperties size={16} />
        <span id="reference-heading">{title}</span>
        <small>{count} formulas</small>
        <ChevronDown className={open ? 'rotated' : ''} size={18} />
      </button>

      {open && (
        <div className="reference-groups">
          {groups.map((group) => (
            <div className="reference-group" key={group.heading}>
              <h3>{group.heading}</h3>
              <dl>
                {group.items.map((item) => {
                  const plain = item.rel === false;

                  return (
                    <div className={plain ? 'is-note' : ''} key={`${item.left}=${item.right}`}>
                      <dt>{plain ? item.left : <Math>{item.left}</Math>}</dt>
                      <dd>
                        {!plain && (
                          <span className="reference-rel" aria-hidden="true">
                            <Math>{item.rel ?? '='}</Math>
                          </span>
                        )}
                        <Math>{item.right}</Math>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(FormulaReference);
